FO=open('myfile.csv', 'r')
while True:
    loglines=FO.readline()
    if loglines.find('my search') >=0:
        print(loglines)
