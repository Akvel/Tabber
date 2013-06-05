// Copyright (c) 2013 Valeriy Akitsev

var query = {
  "active" : false
};

var getHost = function(uri) {
  var sp = uri.split('/');
  var host = sp[2].split(":")[0].replace(/^www./, "");
  if (host == '')
    return sp[0];

  return host;
};

var closeTabByHost = function(host) {
  chrome.tabs.query(query, function(tabs) { /* no close current */
    ids = [];
    for ( var i = 0; i < tabs.length; i++) {
      if (host == getHost(tabs[i].url)) {
        ids.push(tabs[i].id);
      }
    }
    chrome.tabs.remove(ids, null);
    Tabber.refresh();
  });
};

var Tabber = {
  refresh : function() {
    var div = document.getElementById("hostDiv");
    chrome.tabs
        .query(
            query,
            function(tabs) {
              var map = {};
              var res = "<caption>Your inactive tabs</caption>";

              if (tabs.length == 0) {
                div.innerHTML = "<caption>No inactive tabs</caption>";
                return;
              }

              for ( var i = 0; i < tabs.length; i++) {
                host = getHost(tabs[i].url);

                if (!map.hasOwnProperty(host)) {
                  map[host] = 0
                }

                map[host] += 1;
              }

              keys = [];

              for (k in map) {
                if (map.hasOwnProperty(k)) {
                  keys.push({
                    "k" : k,
                    "v" : map[k]
                  });
                }
              }

              keys.sort(function(a, b) {
                if (b.v - a.v === 0) {
                  return a.k.localeCompare(b.k);
                } else {
                  return b.v - a.v;
                }
              });

              len = keys.length;

              for (i = 0; i < len; i++) {
                k = keys[i];
                cl = "";

                if (k.v > 5)
                  cl = "class='spec'";
                if (k.v > 10)
                  cl = "class='specalt'";

                fi = "<img src='http://www.google.com/s2/u/0/favicons?domain=" + k.k + "'/>";
                
                res += "<tr><td "
                    + cl
                    + ">"
                    + k.k
                    + "<span class='small'> inactive:"
                    + k.v
                    + "</span></td><td style='padding:4px 0 0 4px;'>"
                    + fi
                    + "</td><td class='hovered' data-host='"
                    + keys[i].k + "'>Close all</td></tr>";
              }

              div.innerHTML = res;

              var elements = document
                  .getElementsByClassName("hovered");

              for ( var i = 0; i < elements.length; i++) {
                elements[i]
                    .addEventListener(
                        'click',
                        function() {
                          closeTabByHost(this
                              .getAttribute("data-host"));
                        });
              }
            });
  },

};

document.addEventListener('DOMContentLoaded', function() {
  Tabber.refresh();
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  Tabber.refresh();
});
