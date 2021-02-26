(function ($) {
  $.fn.serializeFormJSON = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name]) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || "");
      } else {
        o[this.name] = this.value || "";
      }
    });
    return o;
  };
  $.fn.scrollView = function () {
    return this.each(function () {
      $("html, body").animate(
        {
          scrollTop: $(this).offset().top - 200,
        },
        1000
      );
    });
  };
})(jQuery);
$(document).ready(function () {
  $("input:checkbox[data-group]").click(function () {
    var group =
      "input:checkbox[name='" + $(this).prop("name") + "'][data-group]";
    $(group).prop("checked", false);
    $(this).prop("checked", true);
  });

  function canContinue(steppers) {
    var allow = true;
    $("form:visible").each(function () {
      var formData = $(this).serializeFormJSON();
      console.log(formData);
      $(this)
        .find("[data-required]:visible")
        .each(function () {
          $(this).find(".form-error").remove();

          var field = $(this).data("required");
          if (field == null || field.trim() === "") return;
          var ans = formData[field];
          if (
            ans == null ||
            (Array.isArray(ans) && ans.length === 0) ||
            ans.toString().trim() === ""
          ) {
            $(this)
              .find("p")
              .append(
                "<span class='form-error'><i class='far fa-arrow-alt-circle-down'></i>Champ obligatoire</span>"
              );
            if (allow === true)
              //  $(this).scrollView();
              allow = false;
          }
        });
    });

    return allow;
  }

  $("form").submit(function (e) {
    if (!canContinue($("[data-stepper]"))) e.preventDefault();
  });

  //le scrol jolie cool
  $("a[href^='#']:not([data-toggle])").click(function (e) {
    e.preventDefault();

    var position = $($(this).attr("href")).offset().top;

    $("body, html").animate(
      {
        scrollTop: position,
      } /* speed */
    );
  });

  $("#objectif_reason span").click(function () {
    $("#objectif_txt").val($(this).text());
  });

  //steppers
  $("[data-stepper]").each(function () {
    var name = $(this).data("stepper");
    if (name == null || name.trim() === "") return;
    var steppers = $(this).find("ul.stepper").children("li");

    $(this)
      .find("section[data-stepper=" + name + "]")
      .each(function () {
        var stepp = this;
        function nextStep(e) {
          e.preventDefault();
          if (canContinue() == false) return;
          for (var i = 0; i < steppers.length; i++) {
            var s = $(steppers)[i];
            var target = $(s).data("section");

            $(s).removeClass("active");
            $(s).addClass("completed");

            $("#" + target).hide();
            if (target === $(stepp).attr("id")) {
              if ($(steppers)[i + 1] != null) {
                $(steppers[i + 1]).addClass("active");
                target = $($(steppers)[i + 1]).data("section");
                $("#" + target).show();
              }
              break;
            }
          }
        }
        $(this).find("[data-stepper-next]").click(nextStep);
        $(this).on("next", nextStep);
      });
  });

  //steppers
  $("[data-stepper]").each(function () {
    var stepper = this;
    var name = $(this).data("stepper");
    if (name == null || name.trim() === "") return;
    var steppers = $(this).find("ul.stepper").children("li");
    $(this)
      .find("section[data-stepper=" + name + "]")
      .each(function () {
        var stepp = this;

        function nextStep(e) {
          e.preventDefault();
          if (!canContinue(stepper)) return;
          $(".div-tittle").addClass("d-none d-md-block");
          for (var i = 0; i < steppers.length; i++) {
            var s = $(steppers)[i];
            var target = $(s).data("section");

            $(s).removeClass("active");
            $(s).addClass("completed");

            $("#" + target).hide();
            if (target === $(stepp).attr("id")) {
              if ($(steppers)[i + 1] != null) {
                $(steppers[i + 1]).addClass("active");
                target = $($(steppers)[i + 1]).data("section");
                $("#" + target).show();
                $("body").scrollView();
              }
              break;
            }
          }
        }

        $(this).find("[data-stepper-next]").click(nextStep);
        $(this).on("next", nextStep);
      });
  });
  //End steppers

  //select autocomplete
  $(function () {
    $.widget("custom.combobox", {
      _create: function () {
        this.wrapper = $("<span>")
          .addClass("custom-combobox")
          .insertAfter(this.element);

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },

      _createAutocomplete: function () {
        var selected = this.element.children(":selected"),
          value = selected.val() ? selected.text() : "";

        this.input = $("<input>")
          .appendTo(this.wrapper)
          .val(value)
          .attr("title", "")
          .addClass(
            "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left"
          )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy(this, "_source"),
          })
          .tooltip({
            classes: {
              "ui-tooltip": "ui-state-highlight",
            },
          });

        this._on(this.input, {
          autocompleteselect: function (event, ui) {
            ui.item.option.selected = true;
            this._trigger("select", event, {
              item: ui.item.option,
            });
          },

          autocompletechange: "_removeIfInvalid",
        });
      },

      _createShowAllButton: function () {
        var input = this.input,
          wasOpen = false;

        $("<a>")
          .attr("tabIndex", -1)
          .attr("title", "Show All Items")
          .attr("height", "")
          .tooltip()
          .appendTo(this.wrapper)
          .button({
            icons: {
              primary: "ui-icon-triangle-1-s",
            },
            text: "false",
          })
          .removeClass("ui-corner-all")
          .addClass("custom-combobox-toggle ui-corner-right")
          .on("mousedown", function () {
            wasOpen = input.autocomplete("widget").is(":visible");
          })
          .on("click", function () {
            input.trigger("focus");

            // Close if already visible
            if (wasOpen) {
              return;
            }

            // Pass empty string as value to search for, displaying all results
            input.autocomplete("search", "");
          });
      },

      _source: function (request, response) {
        var matcher = new RegExp(
          $.ui.autocomplete.escapeRegex(request.term),
          "i"
        );
        response(
          this.element.children("option").map(function () {
            var text = $(this).text();
            if (this.value && (!request.term || matcher.test(text)))
              return {
                label: text,
                value: text,
                option: this,
              };
          })
        );
      },

      _removeIfInvalid: function (event, ui) {
        // Selected an item, nothing to do
        if (ui.item) {
          return;
        }

        // Search for a match (case-insensitive)
        var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          valid = false;
        this.element.children("option").each(function () {
          if ($(this).text().toLowerCase() === valueLowerCase) {
            this.selected = valid = true;
            return false;
          }
        });

        // Found a match, nothing to do
        if (valid) {
          return;
        }

        // Remove invalid value
        this.input
          .val("")
          .attr("title", value + " didn't match any item")
          .tooltip("open");
        this.element.val("");
        this._delay(function () {
          this.input.tooltip("close").attr("title", "");
        }, 2500);
        this.input.autocomplete("instance").term = "";
      },

      _destroy: function () {
        this.wrapper.remove();
        this.element.show();
      },
    });

    $("#combobox").combobox();
    $("#toggle").on("click", function () {
      $("#combobox").toggle();
    });
  });

  //animation
  $(".animated").on("animationend", function () {
    var $this = this;
    $(this).removeClass("animated");
    var c = $(this).data("class");
    if (c != null && c.trim() !== "") {
      $(this).addClass(c);
    }
    c = $(this).data("i-class");
    if (c != null && c.trim() !== "") {
      $(this).children("i").removeClass();
      $(this).children("i").addClass(c);
    }
    c = $(this).data("sibling-class");
    if (c != null && c.trim() !== "") {
      $(this).siblings().removeClass();
      $(this).siblings().addClass(c);
    }
    c = $(this).data("stepper-next");
    if (c != null)
      setTimeout(function () {
        $($this).parents("[data-stepper]").trigger("next");
      }, 2000);
  });
});
