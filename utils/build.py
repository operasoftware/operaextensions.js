#!/usr/bin/env python

import argparse
import json
import os
import shutil
import sys
import tempfile


def main(argv=None):

  parser = argparse.ArgumentParser()
  parser.add_argument('--include', action='append', required=True)
  parser.add_argument('--externs', action='append', default=['externs/common.js'])
  parser.add_argument('--minify', action='store_true', default=False)
  parser.add_argument('--output', default='../build/operaextensions.js')

  args = parser.parse_args()

  output = args.output

  # setup banner

  configFile = open('package.json')

  config = json.load(configFile)
  banner = "/*\n\
 * " + config["description"] + " - " + os.path.basename(output) + "\n\
 * " + config["homepage"] + " (ver: " + config["version"] + ")\n\
 * Copyright (c) 2013 " + config["author"] +" \n\
 * License: " + config["licenses"][0]["type"] + " (" + config["licenses"][0]["url"] + ")\n\
 */\n"

  configFile.close()

  # merge build files

  print(' * Building ' + output)

  fd, path = tempfile.mkstemp()
  tmp = open(path, 'w')

  tmp.write(banner)

  for include in args.include:
    with open('includes/' + include + '.json','r') as f: files = json.load(f)
    for filename in files:
      with open(filename, 'r') as f: tmp.write(f.read())

  tmp.close()

  # save

  if args.minify is False:

      shutil.copy(path, output)
      os.chmod(output, 0o664); # temp files would usually get 0600

  else:

    externs = ' --externs '.join(args.externs)
    # TODO: reapply warning level VERBOSE for better JSHint
    os.system('java -jar compiler/compiler.jar --warning_level=QUIET --jscomp_off=globalThis --externs %s --jscomp_off=checkTypes --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s' % (externs, path, output))

    # header

    with open(output,'r') as f: text = f.read()
    with open(output,'w') as f: f.write(banner + text)

  os.close(fd)
  os.remove(path)


if __name__ == "__main__":
  main()
