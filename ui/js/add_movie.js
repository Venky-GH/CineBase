var main_form_details = {};
var actor = {};
actor.details = {};
var producer = {};
var image_decoded_val;
var request_type = 2; // create new move

$(function () {
  let promiseObj = populate_actors();
  promiseObj.then(function () {
    let inner_promise_obj = populate_producers();
    inner_promise_obj.then(function () {
      setEventListeners();

      var url = location.href;
      if(url.indexOf("?") !== -1) {
        main_form_details = JSON.parse(localStorage.getItem("movie_details"));
        localStorage.removeItem("movie_details");
        console.log(main_form_details);
        request_type = 1; // update an existing movie
        prefill_data();
      }
    });
  });
});

function prefill_data() {
  $("#m_name").val(main_form_details.name);
  // $("#image_file").val(main_form_details.image);
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
    $(".actor_chip_holder").addClass("hidden");
    var val = $(this).val();
    if (val == 1) {
      $(".add_movie_form .existing_actor").removeClass("hidden");
      $(".add_movie_form .new_actor").addClass("hidden");
      actor.mode = 1; // 1 - existing
    }
    else {
      $(".add_movie_form .existing_actor").addClass("hidden");
      $(".add_movie_form .new_actor").removeClass("hidden");
      actor.mode = 2; // 2 - New
    }
  });

  $("input[name='producer_type']").change(function () {
    $(".producer_chip_holder").addClass("hidden");
    var val = $(this).val();
    if (val == 1) {
      $(".add_movie_form .existing_producer").removeClass("hidden");
      $(".add_movie_form .new_producer").addClass("hidden");
      producer.mode = 1; // 1 - existing
    }
    else {
      $(".add_movie_form .existing_producer").addClass("hidden");
      $(".add_movie_form .new_producer").removeClass("hidden");
      producer.mode = 2; // 2 - New
    }
  });

  // image upload event
  $("#image_file").change(function (e) {
    var extension = e.target.value.split(".")[1];
    var allowed_extensions = ["jpg", "jpeg", "png", "gif"];
    if (!allowed_extensions.includes(extension)) {
      alert("File type not allowed!");
      $(this).val("");
    }
    else {
      if(e.target.files[0].size > 2000000) {
        alert("File size exceeded!");
        $(this).val("");
      }
      else
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
        alert("Actor already exists!");
      else
        actor.details[name] = actor_obj;
      update_chips("actor");
    }
    else {
      producer.name = name;
      producer.sex = sex;
      producer.dob = dob;
      producer.bio = bio;
      update_chips("producer");
    }
    $("#details_modal").modal('toggle');
    $(this)[0].reset();
  });

  // main form submit action
  $("#add_movie_form").submit(function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();

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

    if(producer.mode === 1) {
      producer.id = $("#producer_list").val();
    }

    main_form_details.producer = producer;

    main_form_details.request_type = request_type;

    $.ajax({
      url: "/add_movie_details",
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(main_form_details),
      success: function (json) {
        if (json.status === 1) {
          alert("Successfully added!");
        }
      },
      error: function (err) {
        console.log("something went wrong!");
      }
    });
  });
}

function populate_actors() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: '/list_items',
      type: "get",
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
        reject(err);
      }
    });
  });
}

function populate_producers() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: '/list_items',
      type: "get",
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
        reject(json);
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
  };
}

function update_chips(type) {
  var actor_chip_holder = $(".actor_chip_holder");
  var producer_chip_holder = $(".producer_chip_holder");
  actor_chip_holder.empty();
  producer_chip_holder.empty();
  if(type === "actor") {
    if(!actor.details.hasOwnProperty("ids")) {
      $.each(actor.details, function (key, value) {
        if(key !== "ids") {
          var chip = $(".chip_clone").clone();
          chip.removeClass("chip_clone hidden").addClass("chip");
          chip.html(value.name);
        }
        actor_chip_holder.append(chip);
      });
    }
    actor_chip_holder.removeClass("hidden");
  }
  else {
    if(!producer.hasOwnProperty("id")) {
      var chip = $(".chip_clone").clone();
      chip.removeClass("chip_clone hidden").addClass("chip");
      chip.html(producer.name);
      producer_chip_holder.append(chip);
    }
    producer_chip_holder.removeClass("hidden");
  }
}