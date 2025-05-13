# create a fresh env called “nagai”
conda create -n nagai python=3.10 -y          # or 3.11/3.12 if you prefer
conda activate nagai

# ensure pip is available in this env
python3 -m pip install --upgrade pip

# install packages (some aren't on Conda yet, so pip is easier)
pip3 install fastapi "uvicorn[standard]" \
    sqlalchemy psycopg2-binary python-dotenv \
    supabase google-auth cryptography httpie python-multipart email-validator \
    alembic
