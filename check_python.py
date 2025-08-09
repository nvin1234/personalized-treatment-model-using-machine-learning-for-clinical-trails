import sys
import subprocess
import os

def check_python_version():
    """Check Python version compatibility"""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    elif version.major == 3 and version.minor >= 12:
        print("⚠️  Python 3.12+ detected - may have compatibility issues")
        print("   Recommended: Python 3.9-3.11")
    else:
        print("✅ Python version is compatible")
    
    return True

def install_with_no_build_isolation(package):
    """Install package without build isolation to avoid the error"""
    try:
        cmd = [sys.executable, "-m", "pip", "install", "--no-build-isolation", package]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {package} installed successfully")
            return True
        else:
            print(f"❌ Failed to install {package}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Exception installing {package}: {e}")
        return False

def install_precompiled_only(package):
    """Install only precompiled wheels to avoid build issues"""
    try:
        cmd = [sys.executable, "-m", "pip", "install", "--only-binary=all", package]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {package} installed successfully (precompiled)")
            return True
        else:
            print(f"❌ Failed to install {package} (precompiled)")
            return False
    except Exception as e:
        print(f"❌ Exception installing {package}: {e}")
        return False

def upgrade_pip():
    """Upgrade pip to latest version"""
    try:
        cmd = [sys.executable, "-m", "pip", "install", "--upgrade", "pip"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ pip upgraded successfully")
            return True
        else:
            print("❌ Failed to upgrade pip")
            return False
    except Exception as e:
        print(f"❌ Exception upgrading pip: {e}")
        return False

def main():
    print("Heart Treatment System - Python Environment Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        print("\nPlease install Python 3.8-3.11 and try again.")
        return
    
    print("\nStep 1: Upgrading pip...")
    upgrade_pip()
    
    print("\nStep 2: Installing packages with compatibility fixes...")
    
    # List of packages to install in order
    packages = [
        "wheel",
        "setuptools",
        "numpy",
        "pandas", 
        "scikit-learn",
        "flask",
        "flask-cors"
    ]
    
    successful_installs = []
    failed_installs = []
    
    for package in packages:
        print(f"\nInstalling {package}...")
        
        # Try method 1: precompiled wheels only
        if install_precompiled_only(package):
            successful_installs.append(package)
            continue
            
        # Try method 2: no build isolation
        if install_with_no_build_isolation(package):
            successful_installs.append(package)
            continue
            
        # Try method 3: regular install
        try:
            cmd = [sys.executable, "-m", "pip", "install", package]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {package} installed successfully (regular)")
                successful_installs.append(package)
            else:
                print(f"❌ All methods failed for {package}")
                failed_installs.append(package)
        except Exception as e:
            print(f"❌ All methods failed for {package}: {e}")
            failed_installs.append(package)
    
    print("\n" + "=" * 60)
    print("INSTALLATION SUMMARY")
    print("=" * 60)
    
    if successful_installs:
        print("✅ Successfully installed:")
        for package in successful_installs:
            print(f"   - {package}")
    
    if failed_installs:
        print("\n❌ Failed to install:")
        for package in failed_installs:
            print(f"   - {package}")
        
        print("\nAlternative solutions for failed packages:")
        print("1. Try conda: conda install " + " ".join(failed_installs))
        print("2. Download wheels manually from https://pypi.org/")
        print("3. Use a different Python version (3.9-3.11 recommended)")
    
    # Test imports
    print("\nTesting imports...")
    test_packages = {
        'numpy': 'numpy',
        'pandas': 'pandas', 
        'sklearn': 'scikit-learn',
        'flask': 'flask',
        'flask_cors': 'flask-cors'
    }
    
    working_packages = []
    for import_name, package_name in test_packages.items():
        try:
            __import__(import_name)
            print(f"✅ {package_name} import successful")
            working_packages.append(package_name)
        except ImportError:
            print(f"❌ {package_name} import failed")
    
    if len(working_packages) >= 4:  # Need at least numpy, pandas, sklearn, flask
        print("\n🎉 Minimum requirements met! You can proceed with setup.")
        print("Next step: python minimal_setup.py")
    else:
        print("\n⚠️  Some critical packages are missing. See alternative solutions above.")

if __name__ == "__main__":
    main()
