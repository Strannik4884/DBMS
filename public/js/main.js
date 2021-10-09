// open/close mobile hamburger menu
(function($){
  $(function(){
    $('.sidenav').sidenav();
  });
})(jQuery);

// when document ready
$(document).ready(function () {
  // create textarea character counter
  $('input#input_text, textarea#comment').characterCounter();

  // add regexp method to form validation rules
  $.validator.addMethod(
      "regexp",
      function(value, element, regexp) {
        const re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
      },
      "Regular expression failed"
  );

  // form validation
  $("#feedback_form").validate({
    rules: {
      name: {
        required: true,
      },
      email: {
        required: true,
        email: true
      },
      phone: {
        required: true,
        regexp: '^\\+7\\(\\d{3}\\)\\d{3}-\\d{2}-\\d{2}$'
      },
      comment: {
        required: true,
        minlength: 10,
        maxlength: 256
      },
    },
    // error messages
    messages: {
      name:{
        required: "Введите ФИО",
      },
      email:{
        required: "Введите почту",
        email: "Введите корректную почту"
      },
      phone:{
        required: "Введите номер телефона",
        regexp: "Введите номер телефона в международном формате (+#(###)###-##-##)"
      },
      comment:{
        required: "Введите комментарий",
        minlength: "Комментарий должен быть не менее 10 символов"
      }
    },
    // display errors
    errorElement : 'div',
    errorPlacement: function(error, element) {
      const placement = $(element).data('error');
      if (placement) {
        $(placement).append(error)
      } else {
        error.insertAfter(element);
      }
    }
  });

  // global count down
  let requestCountDown

  // feedback form submit event handler
  $('#feedback_form').submit(function (event) {
    // get form
    let feedbackForm = $('#feedback_form');
    // handle default action
    event.preventDefault();
    feedbackForm.validate();
    // if feedback form is valid
    if (feedbackForm.valid()) {
      // parse form data to json
      let formDataJson = {};
      let formData = new FormData(this)
      formData.forEach(function (value, key) {
        formDataJson[key] = value;
      });
      $.ajax({
        type: "POST",
        url: "http://localhost:3000/feedback",
        data: JSON.stringify(formDataJson),
        contentType: "application/json",
        cache: false,
        processData: false,
        success: function (data, status, xhr) {
          // if successful
          if (xhr.status === 201) {
            // show request answer date
            const text = document.createTextNode("С Вами свяжутся после DDDD");
            document.getElementById("response_date").appendChild(text);
            // set request data
            document.getElementById("feedback_name").value = document.getElementById("name").value;
            document.getElementById("feedback_email").value = document.getElementById("email").value;
            document.getElementById("feedback_phone").value = document.getElementById("phone").value;
            document.getElementById("feedback_comment").value = document.getElementById("comment").value;
            // clear and hide feedback form
            document.getElementById("feedback_form").reset();
            $('.character-counter').remove();
            document.getElementById("feedback_form").style.display = "none";
            // show feedback response form
            document.getElementById("feedback_response").style.display = "";
          }
          else {
            alert('Что-то пошло не так - попробуйте позже');
          }
        },
        error: function (xhr) {
          if (xhr.status === 400 && xhr.responseText !== null) {
            try {
              let responseErrorText = JSON.parse(xhr.responseText)
              if (responseErrorText['message'] === 'Feedback check failed') {
                // hide feedback form
                document.getElementById("feedback_form").style.display = "none";
                // set new request date
                const countDownDate = Math.floor(new Date(responseErrorText['details']).getTime() / 1000);
                // update the countdown every 1 second
                requestCountDown = setInterval(function () {
                  // get current date
                  let now = Math.floor(new Date().getTime() / 1000);
                  // find the distance between now and the countdown date
                  let distance = (countDownDate + 3600 * 4) - now;
                  // get hours, minutes and seconds
                  let hours = Math.floor((distance % (60 * 60 * 24)) / (60 * 60)).toString();
                  let minutes = Math.floor((distance % (60 * 60)) / (60)).toString();
                  let seconds = Math.floor(distance % (60)).toString();
                  if (hours.length === 1) {
                    hours = '0' + hours;
                  }
                  if (minutes.length === 1) {
                    minutes = '0' + minutes;
                  }
                  if (seconds.length === 1) {
                    seconds = '0' + seconds;
                  }
                  // update ui element
                  document.getElementById("new_request_date").innerHTML = hours + ":" + minutes + ":" + seconds;
                  // if the countdown is finished, show feedback form
                  if (distance < 0) {
                    clearInterval(requestCountDown);
                    closeWarningForm();
                  }
                }, 1000);
                // show feedback warning form
                document.getElementById("warning_form").style.display = "";
              }
              else {
                alert('Что-то пошло не так - попробуйте позже');
              }
            }
            catch (e) {
              alert('Что-то пошло не так - попробуйте позже');
            }
          }
          else {
            alert('Что-то пошло не так - попробуйте позже');
          }
        }
      });
    }
  });

  // response form submit event handler
  $('#feedback_response').submit(function (event) {
    // handle default action
    event.preventDefault();
    // clear and hide response form
    document.getElementById("feedback_response").reset();
    document.getElementById("response_date").innerHTML = "";
    document.getElementById("feedback_response").style.display = "none";
    // show feedback form
    $('input#input_text, textarea#comment').characterCounter();
    document.getElementById("feedback_form").style.display = "";
  });

  // close warning and show feedback form
  function closeWarningForm(){
    // clear and hide response form
    document.getElementById("warning_form").reset();
    document.getElementById("new_request_date").innerHTML = "";
    document.getElementById("warning_form").style.display = "none";
    // show feedback form
    document.getElementById("feedback_form").style.display = "";
  }

  // feedback warning form submit event handler
  $('#warning_form').submit(function (event) {
    // handle default action
    event.preventDefault();
    clearInterval(requestCountDown)
    closeWarningForm();
  });
});
