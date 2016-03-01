casper.test.begin('google', 1, function (test) {

    var path = casper.cli.options.path;
    var selector = casper.cli.options.selector;
    var output = casper.cli.options.output;
    var capPoints = casper.cli.options.cap.split(",");

    console.log(capPoints)

    casper.start(path, function () {

        var bounds = this.getElementBounds(selector);

        capPoints.forEach(function(v, i){

            setTimeout(function(){

                this.capture(output+i+".png", bounds);

            }.bind(this), v);

        }.bind(this))

    });

    casper.run(function() {

        setTimeout(function(){

            test.done();

        }.bind(this), capPoints[capPoints.length-1]);

    });
});