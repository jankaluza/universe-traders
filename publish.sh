grunt default
git checkout gh-pages
./sync-with-master.sh
git commit -a -m "sync with master"
git push
git checkout master
