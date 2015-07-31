# Banner - Tool

## Running the project

#### Install node dependencies
```
npm install
```

#### Development
To compile all files and start a webserver on [localhost:3000](http://localhost:3000):
```
gulp
```

#### Build and Distribution
The following command will run the following tasks:

- Minify all files
- Compress images
- Inline all JavaScript and StyleSheets in your HTML
- Create a distribution `.zip` file that contains only the assets used on that banner

```
gulp build
```

You will notice a new folder named `dist` in the root of your project, that's where all the distribution files will be kept, including the zip files.
