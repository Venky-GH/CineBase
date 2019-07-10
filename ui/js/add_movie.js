var main_form_details = {};
var actor = {};
actor.details = {};
var producer = {};
var image_decoded_val;
var request_type = 2; // create new move

$(function () {
  $("#loader").removeClass("hidden");
  $("#rest_body").addClass("hidden");

  $("#d_dob").datetimepicker({
    'format': 'YYYY-MM-DD'
  });
  let promiseObj = populate_actors();
  promiseObj.then(function () {
    let inner_promise_obj = populate_producers();
    inner_promise_obj.then(function () {
      setEventListeners();

      var url = location.href;
      if (url.indexOf("?") !== -1) {
        main_form_details = JSON.parse(localStorage.getItem("movie_details"));
        localStorage.removeItem("movie_details");
        image_decoded_val = main_form_details.image;
        $(".form_type").html("Update");
        $(".add_movie_form .note").removeClass("hidden");
        request_type = 1; // update an existing movie
        prefill_data();
      } else {
        image_decoded_val = "default_image";
        $(".form_type").html("Add");
        $(".add_movie_form .note").addClass("hidden");
      }
      $("#loader").addClass("hidden");
      $("#rest_body").removeClass("hidden");
    });
  });
});

function prefill_data() {
  $("#m_name").val(main_form_details.name);
  $("#m_yor").val(main_form_details.yor);
  $("#m_plot").val(main_form_details.plot);
  $("input[name='actor_type'][value='1']").click();
  $("input[name='producer_type'][value='1']").click();
  let actor_list = $("#actor_list");
  let producer_list = $("#producer_list");
  actor_list.val(main_form_details.actor.details.ids);
  producer_list.val(main_form_details.producer.id);
  actor_list.multiselect("refresh");
  producer_list.multiselect("refresh");
}

function setEventListeners() {
  $("#add_producer").click(function () {
    $("#details_modal .modal-header .new_user_type").html("Producer");
    $("#details_modal form").attr("form_type", "producer");
  });

  $("#add_actor").click(function () {
    $("#details_modal .modal-header .new_user_type").html("Actor");
    $("#details_modal form").attr("form_type", "actor");
  });

  $("input[name='actor_type']").change(function () {
    var val = $(this).val();
    if (val == 1) {
      $(".add_movie_form .existing_actor").removeClass("hidden");
      $(".add_movie_form .new_actor").addClass("hidden");
      actor.mode = 1; // 1 - existing
      $(".actor_chip_holder").addClass("hidden");
    } else {
      $(".add_movie_form .existing_actor").addClass("hidden");
      $(".add_movie_form .new_actor").removeClass("hidden");
      actor.mode = 2; // 2 - New
      $(".actor_chip_holder").removeClass("hidden");
    }
  });

  $("input[name='producer_type']").change(function () {
    var val = $(this).val();
    if (val == 1) {
      $(".add_movie_form .existing_producer").removeClass("hidden");
      $(".add_movie_form .new_producer").addClass("hidden");
      producer.mode = 1; // 1 - existing
      $(".producer_chip_holder").addClass("hidden");
    } else {
      $(".add_movie_form .existing_producer").addClass("hidden");
      $(".add_movie_form .new_producer").removeClass("hidden");
      producer.mode = 2; // 2 - New
      $(".producer_chip_holder").removeClass("hidden");
    }
  });

  // image upload event
  $("#image_file").change(function (e) {
    var name_splits = e.target.value.split(".");
    var extension = name_splits[name_splits.length - 1];
    var allowed_extensions = ["jpg", "jpeg", "png", "gif"];
    if (!allowed_extensions.includes(extension)) {
      show_toast(0, "File type not allowed!", "");
      $(this).val("");
    } else {
      if (e.target.files[0].size > 2000000) {
        show_toast(0, "File size exceeded!", "File size limit is 2 MB.");
        $(this).val("");
      } else
        getBase64(e.target.files[0]);
    }
  });

  // actor/producer details form
  $("#details_modal form").submit(function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    // get the details
    var name = $("#d_name").val();
    var sex = $(".details_form input[name='sex']").val();
    var dob = $("#d_dob").val();
    var bio = $("#d_bio").val();

    if ($(this).attr("form_type") === "actor") {
      var actor_obj = {};
      actor_obj.name = name;
      actor_obj.sex = sex;
      actor_obj.dob = dob;
      actor_obj.bio = bio;
      if (actor.details[name] !== undefined)
        show_toast(2, "Actor already exists!", "");
      else
        actor.details[name] = actor_obj;
      update_chips("actor");
    } else {
      producer.name = name;
      producer.sex = sex;
      producer.dob = dob;
      producer.bio = bio;
      update_chips("producer");
    }
    show_toast(1, "Added Successfully!", "");
    $("#details_modal").modal('toggle');
    $(this)[0].reset();
  });

  // main form submit action
  $("#add_movie_form").submit(function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

    // validation
    /*
    f1 - actors check
    f2 - producers check
    f3 - year of release check
     */
    let f1 = 1;
    let f2 = 1;
    let f3 = 1;

    // actor check
    let actor_checks = document.getElementsByName("actor_type");
    if (actor_checks[0].checked || actor_checks[1].checked) {
      if (actor_checks[0].checked) {
        if ($("#actor_list").val().length === 0) {
          f1 = 0;
        }
      } else {
        let count = 0;
        $.each(actor.details, function (key, value) {
          if (key !== "ids")
            count++;
        });
        if (count < 1)
          f1 = 0;
      }
    } else {
      f1 = 0;
    }

    if (f1 === 0) {
      show_toast(2, "Please select/add at least one actor!", "");
    }

    // producer check
    let producer_checks = document.getElementsByName("producer_type");
    if (producer_checks[0].checked || producer_checks[1].checked) {
      if (producer_checks[1].checked) {
        if (!(producer.hasOwnProperty("name") && producer.hasOwnProperty("dob") && producer.hasOwnProperty("sex") && producer.hasOwnProperty("bio")))
          f2 = 0;
      }
    } else {
      f2 = 0;
    }

    if (f2 === 0) {
      show_toast(2, "Select/Add one producer!", "");
    }

    // year of release check
    let year = $("#m_yor").val();
    f3 = check_number(year, 4);

    if (f3 === 0) {
      show_toast(2, "Please enter a valid year!", "");
    }

    if (f1 && f2 && f3) {
      // get and set values
      main_form_details.name = $("#m_name").val();
      main_form_details.image = image_decoded_val;
      main_form_details.yor = $("#m_yor").val();
      main_form_details.plot = $("#m_plot").val();

      if (actor.mode === 1) {
        // get the values from multiselect
        actor.details.ids = $("#actor_list").val();
      }

      main_form_details.actor = actor;

      if (producer.mode === 1) {
        producer.id = $("#producer_list").val();
      }

      main_form_details.producer = producer;

      main_form_details.request_type = request_type;

      $.ajax({
        url: "/add_update_movie_details",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(main_form_details),
        success: function (json) {
          if (json.status === 1) {
            var msg = (request_type === 1) ? "Updated!" : "Added!";
            show_toast(1, "Successfully " + msg, "");
            setTimeout(function () {
              location.href = "/";
            }, 2500);
          }
        },
        error: function (err) {
          console.log("something went wrong! Please try again.");
          show_toast(0, "Something went wrong!", "Please try again.");
        }
      });
    }
  });
}

function check_number(number, len) {
  if (number.length === len) {
    for (var i = 0; i < len; i++) {
      if (("0123456789").indexOf(number[i]) === -1) {
        return 0;
      }
    }
  } else
    return 0;
  return 1;
}

function populate_actors() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: '/list_items',
      type: "GET",
      dataType: "json",
      data: {
        type: 2
      },
      success: function (json) {
        var target = $("#actor_list");
        target.empty();
        if (json.status === 1) {
          $.each(json.list, function (key, value) {
            var option = $(".option_clone").clone();
            option.removeClass("option_clone hidden").addClass("option");
            option.html(value.name);
            option.attr("value", value.actor_id);
            target.append(option);
          });
          target.multiselect({
            includeSelectAllOption: true,
            nonSelectedText: 'Select Actor(s)',
            enableCaseInsensitiveFiltering: true,
            maxHeight: 200,
            buttonWidth: '100%'
          });
          resolve(json);
        }
      },
      error: function (err) {
        console.log("something went wrong!");
        show_toast(0, "Something went wrong!", "Please try again.");
        reject(err);
      }
    });
  });
}

function populate_producers() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: '/list_items',
      type: "GET",
      dataType: "json",
      data: {
        type: 3
      },
      success: function (json) {
        var target = $("#producer_list");
        target.empty();
        if (json.status === 1) {
          $.each(json.list, function (key, value) {
            var option = $(".option_clone").clone();
            option.removeClass("option_clone hidden").addClass("option");
            option.html(value.name);
            option.attr("value", value.producer_id);
            target.append(option);
          });
          target.multiselect({
            includeSelectAllOption: true,
            nonSelectedText: 'Select a Producer',
            enableCaseInsensitiveFiltering: true,
            maxHeight: 200,
            buttonWidth: '100%'
          });
          resolve(json);
        }
      },
      error: function (err) {
        console.log("something went wrong!");
        show_toast(0, "Something went wrong!", "Please try again.");
        reject(err);
      }
    });
  });
}

function getBase64(file) {
  var reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    image_decoded_val = reader.result;
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
    show_toast(0, "Something went wrong!", "Try uploading the image again.");
  };
}

function update_chips(type) {
  var actor_chip_holder = $(".actor_chip_holder");
  var producer_chip_holder = $(".producer_chip_holder");
  actor_chip_holder.empty();
  producer_chip_holder.empty();
  if (type === "actor") {
    if (!actor.details.hasOwnProperty("ids")) {
      $.each(actor.details, function (key, value) {
        if (key !== "ids") {
          var chip = $(".chip_clone").clone();
          chip.removeClass("chip_clone hidden").addClass("chip");
          chip.html(value.name);
        }
        actor_chip_holder.append(chip);
      });
    }
  } else {
    if (!producer.hasOwnProperty("id")) {
      var chip = $(".chip_clone").clone();
      chip.removeClass("chip_clone hidden").addClass("chip");
      chip.html(producer.name);
      producer_chip_holder.append(chip);
    }
  }
}