echo 'node convert.js' | sh
if $(git status | grep -q 'nothing to commit'); then
    exit 0;
else
    echo 'Did not expect any changes, run the converter and commit the changed files!';
    exit 1;
fi
