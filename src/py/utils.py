import os
import json
import os
import tqdm
import shutil
import pandas as pd
from datetime import datetime
import urllib.request

def generate_timelapse_file(opt):
    print('\nGenerating timelapse json file')
    shutil.copy('TimelapseTemplate.tdb', f"{opt.output}/TimelapseTemplate.tdb")

    df = pd.read_csv(f'{opt.output}/detections.csv')
    now = datetime.now()

    dict = {}

    dict['info'] = {"detector": f'{opt.org}_{opt.model}',
                    "detection_completion_time": now.strftime("%Y-%m-%d, %H:%M:%S"),
                    "format_version": "1.0"}

    dict['detection_categories'] = {"1": "rat"}
    dict['classification_categories'] = {"1": "rat"}


    image_list = []

    images = df['Path'].unique()
    pbar = tqdm.tqdm(total=len(images))
    k= 0
    while k < len(images):


        x = []
        bb = df[(df['Path']==images[k]) & (df['Confidence'] !=0)]
        m = 0
        while m < len(bb):


            if opt.output_style == 'flat':
                out_path = r'{}/{}/{}'.format(opt.output,os.path.basename(bb['Path'][0]))
            elif opt.output_style == 'hierachy' or opt.output_style == 'timelapse':
                out_path = bb['Path'][0].replace(f'{opt.input}\\','')
            elif opt.output_style == 'none':
                out_path = bb['Path'][0]
            elif opt.output_style == 'class':
                out_path = r'{}/{}/{}'.format(opt.output,bb['Class'][0],os.path.basename(os.path.basename(bb['Path'][0])))

            bb_coco = eval(bb['Bounded Box'][m])
            md_bb_list = [bb_coco[1],bb_coco[0],bb_coco[3]-bb_coco[1],bb_coco[2]-bb_coco[0]]
            x.append({"category": str(int(float(bb['Class'][m]))),
                    "conf": float(bb['Confidence'][m]),
                    "bbox": md_bb_list,
                    "classifications":[[str(int(float(bb['Class'][m]))),1]]})
            m = m + 1

        image_list.append({"file": out_path.replace('\\', '/'),
                        "max_detection_conf": float(bb['Confidence'].max()),
                        "detections":x})
        pbar.update(1)
        k = k + 1
    pbar.close()
    dict['images'] = image_list
    json_object = json.dumps(dict, indent = 3)
    with open(r'{}/timelapse.json'.format(opt.output), 'w') as outfile:
        outfile.write(json_object)

def connect(host='http://google.com'):
    try:
        urllib.request.urlopen(host) #Python 3.x
        return True
    except:
        return False

def get_class_names(container,alg_name):
    x = container.exec_run('env')
    #print(x)
    y = x[1].decode('utf-8').split('\n')
    class_names = [i for i in y if f'{alg_name.upper()}_CLASSES' in i][0].split('=')[-1]
    class_names = class_names.replace(',???','')
    return class_names

def check_available_algs(container):
    x = container.exec_run('env')
    y = x[1].decode('utf-8').split('\n')
    available_models = [i for i in y if 'AVAILABLE_MODELS' in i][0].split('=')[-1]
    return available_models
