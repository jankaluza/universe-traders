rm -rf ./play
#mkdir play

#git archive master > ./play/master.tar
#cd play
#tar -xf master.tar
#rm -f master.tar
#cd ..
cp -R release play
git add play

cd items
python rebuild.py ../play/resources/items.json
cd ..

cd planets
python rebuild.py ../play/resources/map.json
cd ..
