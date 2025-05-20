# usage: ./setup.sh

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "⚠️ Conda not found. Installing Miniconda..."

    # Detect OS and architecture
    OS=$(uname)
    ARCH=$(uname -m)

    if [[ "$OS" == "Linux" ]]; then
        INSTALLER="Miniconda3-latest-Linux-x86_64.sh"
    elif [[ "$OS" == "Darwin" ]]; then
        if [[ "$ARCH" == "arm64" ]]; then
            INSTALLER="Miniconda3-latest-MacOSX-arm64.sh"
        else
            INSTALLER="Miniconda3-latest-MacOSX-x86_64.sh"
        fi
    else
        echo "❌ Unsupported OS. Please install Miniconda manually:"
        echo "   https://docs.conda.io/en/latest/miniconda.html"
        exit 1
    fi

    # Download and install Miniconda
    curl -LO "https://repo.anaconda.com/miniconda/$INSTALLER"
    bash "$INSTALLER" -b -p "$HOME/miniconda"
    export PATH="$HOME/miniconda/bin:$PATH"
    echo 'export PATH="$HOME/miniconda/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc

    echo "✅ Miniconda installed successfully."
fi

# Create and activate environment
echo "🚀 Creating conda environment: nagai"
source "$(conda info --base)/etc/profile.d/conda.sh"
conda create -n nagai python=3.10 -y
conda activate nagai

# Upgrade pip
python3 -m pip install --upgrade pip

# Install packages (force psycopg2-binary to avoid building from source)
pip install fastapi "uvicorn[standard]" \
    sqlalchemy "psycopg2-binary==2.9.9" --only-binary :all:  # freeze version & force binary

# Install remaining packages
pip install \
    python-dotenv supabase google-auth pyjwt cryptography httpie \
    python-multipart email-validator alembic

echo "✅ Environment setup complete."
echo "👉 Run 'conda activate nagai' to get started."
