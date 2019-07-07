var main_form_details = {};
var actor = {};
actor.mode = 1;
actor.details = {};
actor.details.ids = [];
var producer = {};
producer.mode = 1;

$(function () {
  list_movies_details();
});

function list_movies_details() {
  $.ajax({
    url: "/list_items",
    type: "GET",
    dataType: "json",
    data: {
      type: 1
    },
    success: function (json) {
      if (json.status === 1) {
        $(".movie_details_holder").empty();
        $.each(json.list, function (key, value) {
          var movie_detail_block = $(".movie_detail_block_clone").clone();
          movie_detail_block.removeClass("movie_detail_block_clone hidden").addClass("movie_detail_block");
          movie_detail_block.attr("id", value.movie_id);
          movie_detail_block.find(".image img").attr("src", value.image);
          movie_detail_block.find(".basic_details .movie_name").html(value.name);
          var actors_info_list = value.actors.split(", ");
          $.each(actors_info_list, function (key, value) {
            var actor_info = value.split("+");
            var chip = $(".chip_clone").clone();
            chip.removeClass("chip_clone hidden").addClass("chip");
            chip.html(actor_info[0]);
            chip.attr("id", actor_info[1]);
            movie_detail_block.find(".basic_details .actors .list").append(chip);
          });
          var producer_info = value.producer.split('+');
          movie_detail_block.find(".basic_details .producer .name").html(producer_info[0]);
          movie_detail_block.find(".basic_details .producer .name").attr("id", producer_info[1]);
          movie_detail_block.find(".basic_details .yor").html(value.yor);
          movie_detail_block.find(".plot").html(value.plot);
          $(".movie_details_holder").append(movie_detail_block);
        });
        setEventListeners();
      }
    },
    error: function (err) {
      console.log("something went wrong!");
    }
  });
}

function setEventListeners() {
  $(".edit_movie").click(function () {
    let movie_detail_block = $(this).parents(".movie_detail_block");
    main_form_details.id = movie_detail_block.attr("id");
    main_form_details.name = movie_detail_block.find(".basic_details .movie_name").html();
    main_form_details.plot = movie_detail_block.find(".plot").html();
    main_form_details.yor = movie_detail_block.find(".basic_details .yor").html();
    main_form_details.image = "random.jpg";
    $.each(movie_detail_block.find(".actors .list .chip"), function (key, value) {
      actor.details.ids.push(value.getAttribute("id"));
    });
    producer.id = movie_detail_block.find(".producer .name").attr("id");
    main_form_details.actor = actor;
    main_form_details.producer = producer;
    console.log(main_form_details);
    localStorage.setItem("movie_details", JSON.stringify(main_form_details));

    // redirect to add-movie screen with all the data
    location.href = "/add-movie?requestType=" + 1;
  });
}