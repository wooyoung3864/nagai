# usage: ./run_backend.sh

source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate nagai
export PYTHONPATH=.
uvicorn main:app --reload
