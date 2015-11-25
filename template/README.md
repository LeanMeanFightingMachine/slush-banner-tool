# <%= banner %> - <%= client %>

## Running the project

#### Install node dependencies
```
npm install
```

#### Development
To start a webserver on [localhost:3000](http://localhost:3000):
```
gulp
```

#### Add new templates and variants
You can create new templates and variants by running `gulp add`:
```
gulp add --template master --variant cat
```

Or if you want to omit the variant and create only the template:
```
gulp add --template master
```

But to create a variant, you always have to set the template you want to use.

You can also create a variant by cloning an existing one:
```
gulp clone --input cat --destination dog
```
<% if (platform === 'doubleclick') { %>
You can set the Doubleclick Profile ID to use for the variant:
```
gulp add --template master --variant cat --profileid 1234567
```
<% } %>
#### Build and Distribution
The following command will run the following tasks:

- Minify all files
- Compress images
- Inline all JavaScript and StyleSheets in your HTML
- Create a distribution `.zip` file that contains only the assets used on that banner

```
gulp build
```

You will notice a new folder named `build` in the root of your project, that's where all the distribution files will be kept, including the zip files.
