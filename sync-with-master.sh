rm -rf ./play
#mkdir play

#git archive master > ./play/master.tar
#cd play
#tar -xf master.tar
#rm -f master.tar
#cd ..
cp -R release play
git add play

rm -rf ./develop/api
cp -R docs ./develop/api
git add develop/api

cd items
find -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0 rm -R
python rebuild.py ../play/resources/items.json
cd ..
git add items

cd planets
find -mindepth 1 -maxdepth 1 -type d -print0 | xargs -0 rm -R
python rebuild.py ../play/resources/map.json ../play/resources/items.json ../play/resources/dialogs.json
cd .. 
git add planets
