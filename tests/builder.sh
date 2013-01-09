#!/bin/bash
files=`ls ../build`
for file in $files
do
   filesToReplace=`find . -name "$file"`
   for fToR in $filesToReplace
   do
      cp -f ../build/$file $fToR
   done
done
