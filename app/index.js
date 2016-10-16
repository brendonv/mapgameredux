// import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
// import { createStore } from 'redux'
// import todoApp from './reducers'
// import App from './components/App'

// let store = createStore(todoApp)

  var degrees = 180 / Math.PI,
      ratio = window.devicePixelRatio || 1,
      width = window.innerWidth,
      height = window.innerHeight*.7,
      p = ratio;

  var projection = d3.geo.orthographic()
      .rotate([97, -30])
      .scale(height / 2 - 1)
      .translate([width / 2, height / 2])
      .clipExtent([[-p, -p], [width + p, height + p]])
      .precision(.5);

  var canvas = d3.select("#map").append("canvas")
      .attr("width", width * ratio)
      .attr("height", height * ratio)
      .style("width", width + "px")
      .style("height", height + "px");

  var c = canvas.node().getContext("2d");

  var path = d3.geo.path()
      .projection(projection)
      .context(roundRatioContext(c));

  queue()
      .defer(d3.json, "/public/world-110m.json")
      .defer(d3.tsv, "/public/world-country-names-edited.tsv")
      .await(ready);

  function ready(error, world, names) {
    if (error) throw error;
    var ipt = document.getElementById("u-input"),
        next = document.getElementById("next"),
        s_in = document.getElementById('start-input'),
        start_button = document.getElementById("start-btn"),
        m_cont = document.getElementById('map-container'),
        i_cont = document.getElementById('intro-container'),
        time = document.getElementById("time"),
        hint = document.getElementById("hint"),
        timer = new Timer(time),
        game = new Game();
    
    start_button.onclick = init;
    next.onclick = nextPlace;
    hint.onclick = nextHint;
    s_in.focus();

    (function startSequence() {
      var arr = "loading".split('');
      window.setTimeout(function() {
        for (var i=0; i<arr.length; i++) {
          window.setTimeout(text, 200*i, i);
        }
        function text(i) { 
          s_in.value = arr[i];
          if (i === arr.length -1) {
            window.setTimeout(function() {
              s_in.style.display = 'none';
              start_button.style.display = 'block';
            }, 500);
          }
        }
      }, 1000);
    })();

    var globe = {type: "Sphere"},
        land = topojson.feature(world, world.objects.land),
        countries = topojson.feature(world, world.objects.countries).features,
        borders = topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }),
        index = null,
        hintIndex = 0,
        country,
        called = {},
        i = -1,
        i0 = i;

    ipt.onkeypress = getInput;

    countries = countries.filter(function(d) {
      return names.some(function(n) {
        if (d.id == n.id) return d.name = n.name;
      });
    }).sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });
    var n = countries.length;

    var zoom = d3.geo.zoom()
        .projection(projection)
        .duration(function(S) { return 2000 * Math.sqrt(S); }) // assume ease="quad-in-out"
        .scaleExtent([height / 2 - 1, Infinity])
        .on("zoom", function() {
          projection.clipAngle(Math.asin(Math.min(1, .5 * Math.sqrt(width * width + height * height) / projection.scale())) * degrees);
          c.clearRect(0, 0, width * ratio, height * ratio);
          c.clearRect(0, 0, width * ratio, height * ratio);
          c.fillStyle = "#000", c.beginPath(), path(land), c.fill();
          if (index !== null) c.fillStyle = "#f00", c.beginPath(), path(countries[index]), c.fill();
          c.strokeStyle = "#fff", c.lineWidth = .5 * ratio, c.beginPath(), path(borders), c.stroke();
          // c.strokeStyle = "#000", c.lineWidth = 2 * ratio, c.beginPath(), path(globe), c.stroke();
        })
        .on("zoomend", rotateEnd);

    canvas
        .call(zoom.event);


    function rotateEnd() {
      if (index) console.log("country", countries[index].name);
    }

    function init() {
      i_cont.style.display = "none";
      m_cont.style.display = "block";
      time.classList.remove("hide");
      ipt.focus();
      nextPlace();
    }

    function nextPlace() {
      // console.log("next", index);
      //Clear old value and focus on input
      if (country) {
        if (ipt.value.toLowerCase() === country.name.toLowerCase()) {
          ipt.classList.add('correct');
        } else {
          ipt.classList.add('error');
          ipt.value = country.name;
        }
      }
      window.setTimeout(function() {
        ipt.classList.remove('error');
        ipt.classList.remove('correct');
        ipt.value = "";
        ipt.focus();
      }, 1000);
      //Clear hint index
      hintIndex = 0;
      //Start timer
      timer.start();
      if (index !== null) called[countries[index].name] = true;
      //Increment index to grab next country
      index = getRandomIndex();
      //If using one large list, make sure haven't picked country
      while (called.hasOwnProperty(countries[index].name)) {
        index = getRandomIndex();
      }
      //Start timer

      // console.log("next country: ", countries[index].name, index);
      country = countries[index];
      zoomBounds(projection, country);
      canvas.transition()
          .ease("quad-in-out")
          .duration(2000)
          .call(zoom.projection(projection).event);

      function getRandomIndex() {
        return Math.floor(Math.random()*(n-1));
      }
    }

    function nextHint() {
      if (hintIndex > country.name.length-1) return;
      if (ipt.value.toLowerCase() === country.name.slice(0,ipt.value.length).toLowerCase()) hintIndex = ipt.value.length; 
      if (hintIndex === 0 && ipt.value.length) ipt.value = '';
      ipt.value = country.name.slice(0,hintIndex+1);
      hintIndex++;
      ipt.focus();
    }

    function zoomBounds(projection, o) {
      var centroid = d3.geo.centroid(o),
          clip = projection.clipExtent();
      projection
          .rotate([-centroid[0], -centroid[1]])
          .clipExtent(null)
          .scale(1)
          .translate([0, 0]);

      var b = path.bounds(o),
          k = Math.min(1000, .45 / Math.max(Math.max(Math.abs(b[1][0]), Math.abs(b[0][0])) / width, Math.max(Math.abs(b[1][1]), Math.abs(b[0][1])) / height));

      projection
          .clipExtent(clip)
          .scale(k)
          .translate([width / 2, height / 2]);
    }

    function getInput(e) {
        if (e.which === 13 || e.keyCode === 13) {
          checkAnswer(ipt.value);
        }
      }

      function checkAnswer(input) {
        if (country && country.name && input && input.toLowerCase() === country.name.toLowerCase()) {
          var totalTime = timer.end(), gameScore;
          gameScore = game.score(totalTime);
          nextPlace();
        }
      }
  }

  // Round to integer pixels for speed, and set pixel ratio.
  function roundRatioContext(context) {
    return {
      moveTo: function(x, y) { context.moveTo(Math.round(x * ratio), Math.round(y * ratio)); },
      lineTo: function(x, y) { context.lineTo(Math.round(x * ratio), Math.round(y * ratio)); },
      closePath: function() { context.closePath(); }
    };
  }

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
