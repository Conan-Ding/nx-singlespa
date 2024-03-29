# AmeripharmaSspa

## Build Locally

There are two ways doing this. One is to run the shell scripts directly, for instance:

assume you run from root directly
```js
chmod a+x ./shell/build-plugins.sh
./shell/build-plugins.sh
```
// or under any directory
```js
yarn build-plugins
```



## Generate code

The plugin can be used to generate a basic template for react application by running
```js
nx g @ameripharma-sspa/nx-react-singlespa:app
```

## Running tasks

To run an application for development, simply call nx executors for instance, for an application called **todo**, just run
```js
nx serve todo
```
and the generator also create a package.json script, like
```js
{
 "run:single-spa-todo": "webpack serve --config apps/todo/extra-webpack.config.js"
}
```
serve this command will create a single spa file ready as a micro-frontend application

## Plugin Develop 100
The nx-react-singlespa is the good start if you want to go down the rabbit hole. The basic logic of the source code is the normalize the options, call original generator, and then add more files, update existing files, and perform other actions