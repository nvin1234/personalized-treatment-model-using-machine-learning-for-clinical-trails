import sys
import os

def check_python():
    print("Python Installation Check")
    print("=" * 30)
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    print(f"Current directory: {os.getcwd()}")

def check_packages():
    print("\nPackage Installation Check")
    print("=" * 30)
    
    packages = {
        'pandas': 'pandas',
        'numpy': 'numpy', 
        'sklearn': 'scikit-learn',
        'flask': 'flask',
        'flask_cors': 'flask-cors'
    }
    
    installed = []
    missing = []
    
    for import_name, package_name in packages.items():
        try:
            __import__(import_name)
            print(f"✓ {package_name}")
            installed.append(package_name)
        except ImportError:
            print(f"✗ {package_name}")
            missing.append(package_name)
    
    if missing:
        print(f"\nTo install missing packages, run:")
        print(f"pip install {' '.join(missing)}")
    else:
        print("\n✓ All packages are installed!")

def check_files():
    print("\nFile Check")
    print("=" * 30)
    
    required_files = [
        "new heart clinical.csv",
        "simple_setup.py",
        "simple_app.py"
    ]
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ {file}")
        else:
            print(f"✗ {file}")

if __name__ == "__main__":
    check_python()
    check_packages()
    check_files()
    
    print("\nNext Steps:")
    print("1. If packages are missing, install them with pip")
    print("2. Make sure 'new heart clinical.csv' is in this directory")
    print("3. Run: python simple_setup.py")
    print("4. Run: python simple_app.py")
