## Sentinel Laptop: Beta Version
import argparse
import os
import docker
import GPUtil
import json
import numpy as np
import os
from PIL import Image, ImageDraw
import requests
import tqdm
import time
import csv
from multiprocessing import Pool
import multiprocessing
from contextlib import closing
import glob
import sys
import shutil
import inquirer
import platform

import utils


user_input = input()
user_input = json.loads(user_org)
#print(user_org)

## Function to process the image (this is a threaded function)
def process(filename):
    detections = []
    # Convert Confidence Threshold to 0-1 from 0-100
    confidence_threshold = float(os.environ.get('THRESHOLD'))/100
    output = os.environ.get('OUTPUT')
    input  = os.environ.get('INPUT')
    output_size = os.environ.get('OUTPUT_SIZE')
    input_size  = int(os.environ.get('INPUT_SIZE'))
    output_style  = os.environ.get('OUTPUT_STYLE')
    model  = os.environ.get('MODEL')
    class_names  = os.environ.get('CLASS_NAMES').split(',')
    # Make pictures with bounded boxes if requested

    if len(glob.glob(f"{output}/**/{os.path.basename(filename)}")) != 0:
        return 'Processed'
    else:
        try:

            img = Image.open(filename)
            image = img.resize([input_size,input_size])
            if output_size != 'None':
                w, h = img.size
                image_out = img.resize([int(output_size),int(int(output_size)/w*h)])
            else:
                image_out = img
            width_out, height_out = image_out.size

            # Normalize and batchify the image
            im = np.expand_dims(np.array(image), 0).tolist()
            url = 'http://localhost:8501/v1/models/{}:predict'.format(model)
            k = 0
            while True:
                if k == 10:
                    data = json.dumps({"signature_name": "serving_default", "instances": im})
                else:
                    try:
                        data = json.dumps({"signature_name": "serving_default", "instances": im})
                        break
                    except Exception as e:
                        time.sleep(0.2)
                        k = k + 1

            headers = {"content-type": "application/json"}
            json_response = requests.post(url, data=data, headers=headers,timeout=30)
            predictions = json.loads(json_response.text)['predictions'][0]

            # Check there are any predictions
            if predictions['output_1'][0] > confidence_threshold:
                ## Continue to loop through predictions until the confidence is less than specified confidence threshold
                x = 0
                while True:
                    if predictions['output_1'][x]>confidence_threshold and x < len(predictions['output_1']):
                        bbox = [i / input_size for i in predictions['output_0'][x]]
                        class_id = predictions['output_2'][x]
                        confidence = predictions['output_1'][x]
                        class_name = class_names[int(class_id)-1]

                        # Make pictures with bounded boxes if requested
                        # Draw bounding_box

                        if output_style != 'timelapse':
                            draw = ImageDraw.Draw(image_out)
                            draw.rectangle([(bbox[1]*width_out,bbox[0]*height_out),(bbox[3]*width_out,bbox[2]*height_out)],outline='red',width=3)

                            # Draw label and score
                            result_text = str(class_name) + ' (' + str(confidence) + ')'
                            draw.text((bbox[1] + 10, bbox[0] + 10),result_text,fill='red')
                        entry = [os.path.basename(filename),class_name,class_id,confidence,filename,bbox]
                        detections.append(entry)

                        x = x + 1
                    else:
                        break
            else:
                class_name = 'blank'
                detections.append([os.path.basename(filename),class_name,0,0,filename,''])


            if output_style == 'flat':
                out_path = r'{}/{}'.format(output,os.path.basename(filename))
            elif output_style == 'hierachy' or output_style == 'timelapse':
                out_path = r'{}/{}'.format(output,filename.replace(input,''))
            elif output_style == 'class':
                out_path = r'{}/{}/{}'.format(output,class_name,os.path.basename(filename))
            elif output_style == 'none':
                pass
            else:
                print('Error: Output Style is incorrect')

            if output_style != 'none':
                try:
                    image_out.save(out_path)
                except Exception as e:
                    os.makedirs(out_path.replace(os.path.basename(filename),''))
                    image_out.save(out_path)
        except Exception as e:
            print(e)
            detections.append([os.path.basename(filename),99,0,filename,''])
        return detections


def main(opt,container=None):

    os.environ['THRESHOLD'] = str(opt.thresh)
    os.environ['OUTPUT'] = opt.output
    os.environ['INPUT'] = opt.input
    os.environ['OUTPUT_SIZE'] = str(opt.output_size)
    os.environ['INPUT_SIZE'] = str(opt.input_size)
    os.environ['OUTPUT_STYLE'] = str(opt.output_style)
    os.environ['MODEL'] = opt.model
    os.environ['CLASS_NAMES'] = utils.get_class_names(container,opt.model)

    # Check resources available on current machine
    try:
        GPU_num = len(GPUtil.getAvailable())
        if GPU_num == 0:
            print('Starting tensorflow container optimized for CPUs')
        else:
            print('GPU support does not yet exist')
    except Exception as e:
        print('Error')
        GPU_num = 'Unknown'
    print(f"CPUs Available: {os.cpu_count()}, GPUs Available: {GPU_num}")
    time.sleep(3)


    ## Make list of files
    images = []

    for path, subdirs, files in os.walk(opt.input):
        for file in files:
            if file.endswith(".jpg") or file.endswith(".jpeg") or file.endswith(".png") or file.endswith(".JPG") or file.endswith(".JPEG") or file.endswith(".PNG"):
                images.append(os.path.join(path, file))
    if opt.max_images != None:
        images = images[:opt.max_images]

    if len(images) == 0:
        exit('No images found')





    num_workers = multiprocessing.cpu_count() - 2
    print(f'\nProcessing on {num_workers} parallel threads. (It may take a few seconds to start!)')
    pbar = tqdm.tqdm(total=len(images))
    image_count = 0
    empty_count = 0
    with open(f'{opt.output}/detections.csv', 'a',newline='') as file:
        fieldnames = [['File','Class Name','ClassID','Confidence','Path','Bounded Box']]
        writer = csv.writer(file)
        writer.writerows(fieldnames)
        detection_count = 0
        with closing(multiprocessing.Pool(processes=num_workers)) as pool:
            detections = pool.imap_unordered(process,images)
            # open file and write out all rows from incoming lists of rows
            for detection in detections:
                if detection=='Processed':
                    pbar_text = 'Already Processed'
                elif detection[0][2] != 0:
                    detection_count = detection_count + 1
                else:
                    empty_count = empty_count + 1
                pbar_text = f'Found {detection_count} objects in {image_count} images. {empty_count} empty images'
                if detection!='Processed':
                    writer.writerows(detection)

                pbar.set_description(pbar_text, refresh=True)
                pbar.update(1)
                image_count = image_count + 1

    pbar.close()

    if opt.output_style == 'timelapse':
        utils.generate_timelapse_file(opt)


## Set up the processing parameters and fill in anything not covered by CLI parameters with user input
def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--download', action='store_true',
                    help='Download image')
    parser.add_argument('--org', type=str,
                        help='which org to run')
    parser.add_argument('--model', type=str, help='which model to run')
    parser.add_argument('--input', type=str,
                        help='Folder to be processed')
    parser.add_argument('--output', type=str,
                        help='Folder to where results are put')
    parser.add_argument('--key', type=str,
                        help='Path to auth key')
    parser.add_argument('--thresh', type=int,
                        default=40, help='threshold of model')
    parser.add_argument('--output_style', type=str,
                        default='class', help='Download image')
    parser.add_argument('--input_size', type=int,
                        default=256, help='size of images into model')
    parser.add_argument('--max_images', type=int,
                        help='size of images into model')
    parser.add_argument('--output_size', type=int,
                        help='size of images into output folder')
    parser.add_argument('--overwrite', action='store_true',
                        help='size of images into model')
    parser.add_argument('--only_timelapse',action='store_true',
                        help='Only run timelapse json creation')
    opt = parser.parse_args()

    if opt.only_timelapse:
        utils.generate_timelapse_file(opt)
        sys.exit(1)


    org=user_input['org']
    model=user_input['model']
    # input=user_input['input']
    # output=user_input['output']

    client = docker.from_env()

    num_workers = multiprocessing.cpu_count() - 2
    ## Check Organization Bucket
    opt.org=org
    opt.model=model
    opt.input="C:\\Users\\ninar\\inputs-test"
    opt.output="C:\\Users\\ninar\\outputs-test"

    inputExist=os.path.exists(opt.input)
    outputExist = os.path.exists(opt.output)
    if not inputExist or not outputExist:
      print('check that your chosen directories exist')
      return


    if opt.org is None:
        print('input org')
        return
    #print('starting container')
    container_name = "us-west2-docker.pkg.dev/sentinel-project-278421/{}/{}".format(opt.org,opt.org)
    try:
        query = f'docker kill sentinel'
        os.system(query)
        client.containers.prune()
        if utils.connect():
            #print('Pulling Container')
            client.images.pull(container_name)
        #print('Starting container')
        container = client.containers.run(container_name,detach=True, name=f'sentinel',ports={8501:8501},cpu_count=num_workers,mem_limit='5g')
        #print('Container created successfully')
    except Exception as e:
            #if os.path.exists(f'{opt.org}.json'):
               #print('Key Found!')
            opt.key = f'{opt.org}.json'
            #elif opt.key is None:
                #opt.key = input("Path to credential key: ")
            if platform.system() == 'Windows':
                #print('Adding auth key to Windows')
                query = f'docker login -u _json_key --password-stdin https://us-west2-docker.pkg.dev < {opt.key}'
            else:
                #print('Adding auth key to Linux/Mac')
                query = f'cat {opt.key} | docker login -u _json_key --password-stdin https://us-west2-docker.pkg.dev'
            #print(query)
            os.system(query)
            while True:
               #print(f'Downloading Image from Google Cloud Platform with {opt.key} credentials')
                container = client.containers.run(container_name,detach=True, name=f'sentinel',ports={8501:8501},cpu_count=num_workers,mem_limit='5g')
            #except Exception as e:
            #    print(e)
            #    print('Error finding model. Please check organization and key.')
            #    sys.exit()

    #time.sleep(10)
    #print('success')
    available_algs = utils.check_available_algs(container).split(',')
   # print(available_algs)
    #alg_predefined=False
    # for alg in available_algs:
        # if alg == opt.model:
            # alg_predefined=True
            # print('Model found!')

    ## Change the MODELNAME environmental variable
    container.kill()
    client.containers.prune()
    container = client.containers.run(container_name,detach=True, name=f'sentinel',ports={8501:8501},cpu_count=num_workers,mem_limit='5g',environment=[f'MODEL_NAME={opt.model}'])

    while True:
        # Check the input folder exists (exit if it doesnt)
        if not os.path.exists(opt.input):
            print('Input folder does not exist... Please try again: ')
        elif not os.path.exists(opt.output):
            print('Output folder does not exist... Please try again: ')
        else:
            break


    if opt.overwrite:
        try:
            shutil.rmtree(opt.output)
        except OSError as e:
            print("Error: %s : %s" % (opt.output, e.strerror))

    # Check if output folder exists, and create it if it doesn't
    # opt.output = r'{}/{}'.format(opt.output, opt.model)
    # if not os.path.exists(opt.output):
    #     print('Output folder does not exist... Creating.')
    #     os.makedirs(opt.output)


    main(opt,container)

    ## Clean up
    print('\nShutting down container')
    container.kill()
    client.containers.prune()


if __name__ == '__main__':
    os.system('docker kill sentinel')
    run()
