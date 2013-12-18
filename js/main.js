(function ($, _, Backbone) {
  var ChatApp, MessageModel, ChatSession, MessageView, ChatView, messages;

  ChatApp = new Backbone.Marionette.Application();
  ChatApp.addRegions({
    mainRegion: '#chatregion'
  });
  MessageModel = Backbone.Model.extend({});
  ChatSession = Backbone.Collection.extend({
    model: MessageModel
  });
  MessageView = Backbone.Marionette.ItemView.extend({
    template: '#message-template',
    className: 'row'
  });
  ChatView = Backbone.Marionette.CompositeView.extend({
    template: '#chat-template',
    itemView: MessageView,
    id: 'scrollbox',
    collectionEvents: {
      'add': 'onShow'
    },
    initialize: function () {
      this.listenTo(this.collection, "sort", this.renderCollection);
    },
    appendHtml: function (collectionView, itemView) {
      collectionView.$el.append(itemView.el);
    },
    onShow: function () {
      this.$el.animate({
        scrollTop: this.$el[0].scrollHeight
      }, 1 * 1000);
    }
  });

  ChatApp.addInitializer(function (options) {
    var chat = new ChatView({
      collection: options.messages
    });
    ChatApp.mainRegion.show(chat);
  });

  messages = new ChatSession([
    {username: 'user1',
      message: 'This is a test message!'},
    {username: 'you',
      message: 'I just sent this message.'}
  ]);
  ChatApp.start({messages: messages});

  $('#sendmessage, #newmessage').on('click keyup', function (evt) {
    if (evt.type === 'click' || (evt.type === 'keyup' && evt.keyCode === 13)) {
      var messagebox, message;
      messagebox = $('#newmessage');
      message = messagebox.val();
      if (message !== '') {
        messages.add({
          username: 'you',
          message: message
        });
        messagebox.val('');
      }
    }
  });

  setInterval(function () {
    var newmessage, newauthor;
    newmessage = '';
    newauthor = '';
    $.ajax({
      url: 'http://api.forismatic.com/api/1.0/',
      dataType: 'jsonp',
      jsonp: 'jsonp',
      data: {
        method: 'getQuote',
        format: 'jsonp',
        lang: 'en'
      },
      success: function (data) {
        newmessage = data.quoteText;
        newauthor = data.quoteAuthor;
        if (newauthor === '') newauthor = 'unknown';
        messages.add({
          username: newauthor,
          message: newmessage
        });
      }
    });
  }, 5 * 1000);

})(jQuery, _, Backbone);