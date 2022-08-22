import os

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

with open(os.path.join(os.getcwd()+'\src\py', 'logfile.txt'), 'r') as read_file:
    raw_data = read_file.readlines()


my_save_data = open(os.getcwd()+'\src\py\logfile.csv', "w")

for lines in raw_data:
    my_save_data.write(lines + "\n")

my_save_data.close()
