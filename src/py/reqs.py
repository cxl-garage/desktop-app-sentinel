import subprocess
import sys
import pkg_resources
from pkg_resources import DistributionNotFound, VersionConflict

#sys.stdout.flush()
 #install requirements

# dependencies can be any iterable with strings,
# e.g. file line-by-line iterator
dependencies = ['docker', 'GPUtil', 'numpy', 'pandas', 'Pillow', 'requests', 'tqdm', 'inquirer', 'pypiwin32']

# here, if a dependency is not met, a DistributionNotFound or VersionConflict
# exception is thrown.
reqsDownloaded=False
#try except for requiring dependencies
#install package if not installed
#break if installed
try:
    pkg_resources.require(dependencies)
    reqsDownloaded=True
    print('reqs already downloaded')
    #all reqs downloaded, component not needed
except DistributionNotFound:
    reqsDownloaded=False
    for dep in dependencies:
        try:
            pkg_resources.require(dep)
        except:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(dep + 'not installed')

sys.stdout.flush()
