define(function(require) {

  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  var entriesTemplate = require('text!templates/entries.html');
  var docs = require('collections/docs');
  var settings = require('models/settings');

  var EntriesView = Backbone.View.extend({

    el: '#entries',

    initialize: function() {
      this.template = _.template(entriesTemplate);

      // TODO: update height on resize
      this.height = this.$el.height() - 50;

      docs.deferred.done(_.bind(this.render, this));

      docs
        .on('reset', this.render, this)
        .on('change:title', this.updateTitle, this)
        .on('destroy', this.removeItem, this);

      settings.on('change:openDocId', this.selectOpenDoc, this);
    },

    render: function() {
      this.$el.html(
        this.template({
          query: this.query || '',
          docs: docs.prepare(this.query)
        })
      );

      this.selectOpenDoc();
    },

    $itemById: function(id) {
      return this.$('.item[data-id=' + id + ']');
    },

    updateTitle: function(doc) {
      var $item = this.$itemById(doc.id).find('a');
      if ($item.length && !doc.isEmpty()) {
        $item.text(doc.get('title'));
      } else {
        this.render();
      }
    },

    removeItem: function(doc) {
      this.$itemById(doc.id).remove();
    },

    selectOpenDoc: function() {
      if (this.$selected) {
        this.$selected.removeClass('selected');
      }
      this.$selected = this.$itemById( settings.get('openDocId') )
        .addClass('selected');

      this.scrollToCurrentDoc();
    },

    scrollToCurrentDoc: function() {
      var position = this.$selected.position();
      if (!position) return;
      var top = position.top;
      if (top < 0 || top > this.height) {
        this.$el.scrollTop( top - 15 );
      }
    },

    events: {
      'click .item': 'openDoc',
      // TODO: use keyup to automatically search while typing as soon as #118 is implemented
      'change #search': 'search'
    },

    openDoc: function(e) {
      e.preventDefault();

      $('#menu-button').removeClass('hide'); // TODO probably better to call the function directly
      settings.save('openDocId', this.$(e.currentTarget).attr('data-id'));
    },

    search: function(e) {
      this.query = $(e.target).val();
      this.render();
      // TODO: no need to focus as soon as #118 is implemented
      this.$('#search').focus();
    }

  });


  return EntriesView;
});
