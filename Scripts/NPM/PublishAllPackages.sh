#!/bin/bash

# Set the package name and version
package_version=$PACKAGE_VERSION

# If no package version is provided, exit
if [ -z "$package_version" ]; then
  echo "Package version is required"
  exit 1
fi

# touch npmrc file
touch ~/.npmrc

# Add Auth Token to npmrc file
echo "//registry.npmjs.org/:_authToken=$NPM_AUTH_TOKEN" > ~/.npmrc
echo "//registry.npmjs.org/:email=npm@oneuptime.com" >> ~/.npmrc

publish_to_npm() {
    directory_name=$1
    echo "Publishing $directory_name@$package_version to npm"
    cd $directory_name

    npm version $package_version

    # Before npm install, replace "Common": "file:../Common" with "@oneuptime/common": "$package_version" in package.json
    sed -i "s/\"Common\": \"file:..\/Common\"/\"@oneuptime\/common\": \"$package_version\"/g" package.json

    # Before npm install, replace "CommonServer": "file:../CommonServer" with "@oneuptime/common-server": "$package_version" in package.json
    sed -i "s/\"CommonServer\": \"file:..\/CommonServer\"/\"@oneuptime\/common-server\": \"$package_version\"/g" package.json

    # Before npm install, replace "Model": "file:../Model" with "@oneuptime/model": "$package_version" in package.json
    sed -i "s/\"Model\": \"file:..\/Model\"/\"@oneuptime\/model\": \"$package_version\"/g" package.json

    # Before npm install, replace "CommonUI": "file:../CommonUI" with "@oneuptime/common-ui": "$package_version" in package.json
    sed -i "s/\"CommonUI\": \"file:..\/CommonUI\"/\"@oneuptime\/common-ui\": \"$package_version\"/g" package.json


    npm install
    npm run compile
    npm publish --tag latest

    cd ..
}


publish_to_npm "Common"
publish_to_npm "Model"
publish_to_npm "CommonServer"
publish_to_npm "CommonUI"
publish_to_npm "InfrastructureAgent"
