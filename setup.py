from setuptools import setup, find_packages
from pathlib import Path

setup(
    name="PolicyEngine-UK",
    version="0.1.11",
    author="PolicyEngine",
    license="http://www.fsf.org/licensing/licenses/agpl-3.0.html",
    url="https://github.com/ubicenter/policyengine-uk",
    install_requires=[
        # OpenFisca-UK is required, but for deployment purposes is skipped
        # (Google Cloud Platform) servers have read-only storage
        "plotly",
        "flask",
        "flask_cors",
        "rdbl",
        "kaleido",
        "google-cloud-storage>=1.42.0",
        "gunicorn",
        "PolicyEngine-Core",
    ],
    packages=find_packages(),
)
