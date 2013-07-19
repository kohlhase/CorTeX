function fetch_report(type,name) {
  // delete any traces of previous reports
  var report_type = type+"-report";
  $("#"+report_type).html('');
  if (!name) { // No name, no functionality
    clearInterval(countdown); $("#countdown").html(''); return;}
  $('body').css('cursor', 'progress');
  $.ajax({
    url: "/ajax",
    type: "POST",
    dataType: "json",
    data : {"action":report_type,"component":component,"name":name},
    cache: false,
    success: function(response) {
      $('body').css('cursor', 'auto');
      $("#"+report_type).html(response.report);
      if (response.alive) {
       $("body").removeClass("no-background");
       $("body").addClass("cogs-background");
      } else {
       $("body").removeClass("cogs-background");
       $("body").addClass("no-background");
      }
      clearInterval(countdown);
      //clearTimeout(alarm_t);
      //alarm_t = setTimeout(function() { fetch_corpus_report(name); }, interval);
      var seconds_left = interval / 1000;
      countdown = setInterval(function() {
          $('#countdown').html('<p>Auto-refresh in '+(--seconds_left)+' seconds.</p>');
          if (seconds_left <= 0)
          {
              $('#countdown').html('<p>Refreshing...</p>');
              clearInterval(countdown);
              fetch_report("corpus",name);
          }
      }, 1000);
    }
  });
}

function fetch_corpus_report(corpus_name) {
  return fetch_report("corpus",corpus_name);
}
function fetch_service_report(service_name) {
  return fetch_report("service",service_name);
}

function fetch_classic_report(corpus_name,service_name) {
  $('body').css('cursor', 'progress');
  $.ajax({
      url: "/ajax",
      type: "POST",
      dataType: "json",
      data : {"action":"classic-report","component":component,"corpus":corpus_name,
              "service":service_name},
      cache: false,
      success: function(response) {
          $('body').css('cursor', 'auto');
          $("#report").html(response.report);
          if (response.alive) {
           $("body").removeClass("no-background");
           $("body").addClass("cogs-background");
          } else {
           $("body").removeClass("cogs-background");
           $("body").addClass("no-background");
          }
          clearInterval(countdown);
          //clearTimeout(alarm_t);
          //alarm_t = setTimeout(function() { refresh(); }, interval);
          var seconds_left = interval / 1000;
          countdown = setInterval(function() {
              $('#countdown').html('<p>Auto-refresh in '+(--seconds_left)+' seconds.</p>');
              if (seconds_left <= 0)
              {
                  $('#countdown').html('<p>Refreshing...</p>');
                  clearInterval(countdown);
                  fetch_classic_report(corpus_name,service_name);
              }
          }, 1000);
          $('tr.stats-row').find('td:first').addClass('zoom-td').prepend(
            "<button class='zoom-button'>Expand</button>");
          $(".zoom-button").button({
              icons: {
                  primary: 'ui-icon-circle-plus'
              }, text: false
              }).css({
                  'cursor': 'pointer',
                  'float' : 'left',
                  'width': '25px'
          });
          $("span.ok").parent().children(".zoom-button").button({
              icons: {
                  primary: 'ui-icon-circle-zoomin'
              }, text: false
              }).css({
                  'cursor': 'pointer',
                  'float' : 'left',
                  'width': '25px'
          });
          $("span.what").parent().children(".zoom-button").button({
              icons: {
                  primary: 'ui-icon-circle-zoomin'
              }, text: false
              }).css({
                  'cursor': 'pointer',
                  'float' : 'left',
                  'width': '25px'
          });
          var parts = component.split(":");
          var thisclass = parts.pop();
          var thisparts = thisclass.split(' ');
          var thislevel = thisparts[1];
          if (thislevel == 'category') {
              $("span.what").parentsUntil('table').parent().parent().parent().prev().find(".zoom-button").button({
              icons: {
                  primary: 'ui-icon-circle-minus'
              }, text: false
              }).css({
                  'cursor': 'pointer',
                  'float' : 'left',
                  'width': '25px'
              });                    
          }
          if ((thislevel == 'severity') || (thislevel == 'category')) {
              $("span.category").parentsUntil('table').parent().parent().parent().prev().find(".zoom-button").button({
                  icons: {
                      primary: 'ui-icon-circle-minus'
                  }, text: false
                  }).css({
                      'cursor': 'pointer',
                      'float' : 'left',
                      'width': '25px'
                  });
          }
              //if (component.indexOf(thisclass) != -1) {
                //      $('.zoom-button').text('Collapse');
                  //    zoom_icon = "ui-icon-circle-minus";
              //}
          $('.zoom-button').click(function () {
              var description='';
              var thisclass = ($(this).parent().parent().find('td > span').attr('class'));
              var thisparts = thisclass.split(' ');
              var thislevel = thisparts[1];
              if (component.indexOf(thisclass) != -1) {
                  while (component.indexOf(thisclass) != -1) {
                      var parts = component.split(":");
                      parts.pop();
                      component = parts.join(":");
                  }
              } else {
                  while (component.indexOf(thislevel) != -1) {
                      var parts = component.split(":");
                      parts.pop();
                      component = parts.join(":");
                  }
                  component = component+':'+thisclass;
              }
              var level = component.split(":").length - 1;
              if ((level >= 3) || thisclass == 'ok severity') {
                  window.location.href = 'retval_detail?component='+encodeURIComponent(component);
              }
              fetch_classic_report(corpus_name,service_name);
          });
          $('tr.stats-row').hover(function() {
              $(this).find('td').last().append("<button class='rerun-button'>Rerun</button>");
              var thisclass = $(this).find('td > span').attr('class');
              var thisparts = thisclass.split(' ');
              var thislevel = thisparts[1];
              $(".rerun-button").button({
              icons: {
                  primary: "ui-icon-refresh"
              }, text: false
              }).css({
                  'cursor': 'pointer',
                  'float' : 'right',                        
                  'width': '25px'
              });
              $('.rerun-button').click(function() {
                  var description='';
                  var thisclass = ($(this).parent().parent().find('td > span').attr('class'));
                  var thisparts = thisclass.split(' ');
                  var thislevel = thisparts[1];
                  coded_description = component;
                  if (coded_description.indexOf(thislevel) != -1) {
                      while (coded_description.indexOf(thislevel) != -1) {
                          var parts = coded_description.split(":");
                          parts.pop();
                          coded_description = parts.join(":");
                      }
                  }
                  coded_description = coded_description + ':' + thisclass;
                  var parts = coded_description.split(':');
                  for (var part in parts) {
                      var pair = parts[part].split(' ');
                      if (pair.length>1) {
                          description = description+"\n"+pair[1]+": "+pair[0]+"\n";
                      }
                  }
                  var confirmed = confirm("Mark for Rerun\n"+description);
                  if (confirmed) {
                      $.ajax({
                          url: "/ajax",
                          type: "POST",
                          dataType: "json",
                          data : {"action":"queue-rerun","component":coded_description},
                          cache: false,
                          success: function(response) { 
                                  alert (response.message);
                                  var parts = coded_description.split(":");
                                  parts.pop();
                                  coded_description = parts.join(":");
                                  component = coded_description;
                                  fetch_classic_report(corpus_name,service_name); }
                      });
                  }
              });
          },
          function(){
            //  $('.zoom-button').remove();
              $('.rerun-button').remove();
          });
      }
  });
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}