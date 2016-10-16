# Configuring the build.


Tools: Webpack, Babel, various plugins.

I wanted to get going with some of webpack's great features like hot reloading without a complex
configuration. There are many great react and redux starter kits ( like [here](https://github.com/kriasoft/react-starter-kit), [here](https://github.com/davezuko/react-redux-starter-kit), [here](https://github.com/erikras/react-redux-universal-hot-example), and [here](https://github.com/facebookincubator/create-react-app)), but the config files are pretty dense. In order to learn how the tools work, I feel it is important to get an "n=1" example.

The simplest example (beyond using the webpack CLI for a trivial one liner), taken from the webpack website, looks like this:

```var path = require("path");
module.exports = {
  entry: {
    app: ["./app/main.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "bundle.js"
  }
};```