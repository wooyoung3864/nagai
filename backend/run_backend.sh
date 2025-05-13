source ~/miniconda3/etc/profile.d/conda.sh
conda activate nagai
export PYTHONPATH=.
uvicorn main:app --reload