'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _MessageUtils = require('../../utils/MessageUtils');

var _PeerUtils = require('../../utils/PeerUtils');

var _PeerUtils2 = _interopRequireDefault(_PeerUtils);

var _Scroller = require('../common/Scroller.react');

var _Scroller2 = _interopRequireDefault(_Scroller);

var _MessageItem = require('./messages/MessageItem.react');

var _MessageItem2 = _interopRequireDefault(_MessageItem);

var _Welcome = require('./messages/Welcome.react');

var _Welcome2 = _interopRequireDefault(_Welcome);

var _Loading = require('./messages/Loading.react');

var _Loading2 = _interopRequireDefault(_Loading);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MessagesList = function (_Component) {
  (0, _inherits3.default)(MessagesList, _Component);

  function MessagesList(props, context) {
    (0, _classCallCheck3.default)(this, MessagesList);

    var _this = (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props, context));

    var dialog = context.delegate.components.dialog;

    if (dialog && dialog.messages) {
      _this.components = {
        MessageItem: (0, _lodash.isFunction)(dialog.messages.message) ? dialog.messages.message : _MessageItem2.default,
        Welcome: (0, _lodash.isFunction)(dialog.messages.welcome) ? dialog.messages.welcome : _Welcome2.default
      };
    } else {
      _this.components = {
        MessageItem: _MessageItem2.default,
        Welcome: _Welcome2.default
      };
    }

    _this.dimensions = null;

    _this.onScroll = _this.onScroll.bind(_this);
    _this.onResize = _this.onResize.bind(_this);
    _this.onLoadMore = (0, _lodash.debounce)(_this.onLoadMore.bind(_this), 60, {
      maxWait: 180
    });
    _this.shouldComponentUpdate = _reactAddonsPureRenderMixin.shouldComponentUpdate.bind(_this);
    return _this;
  }

  MessagesList.prototype.componentDidMount = function componentDidMount() {
    this.restoreScroll();
  };

  MessagesList.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    if (!_PeerUtils2.default.equals(nextProps.peer, this.props.peer)) {
      this.dimensions = null;
    }
  };

  MessagesList.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
    var dimensions = this.dimensions;
    var scroller = this.refs.scroller;
    var _props = this.props;
    var uid = _props.uid;
    var messages = _props.messages;
    var count = _props.count;


    var lastMessage = (0, _lodash.last)(messages);
    var isPush = lastMessage && lastMessage !== (0, _lodash.last)(prevProps.messages);
    if (isPush) {
      var isMyMessage = uid === lastMessage.sender.peer.id;
      if (isMyMessage || !dimensions) {
        scroller.scrollToBottom();
      }
    } else {
      var isFirstMessageChanged = prevProps.count !== count || messages[0] !== prevProps.messages[0] && prevProps.isLoading;
      if (isFirstMessageChanged && dimensions) {
        var currDimensions = scroller.getDimensions();
        scroller.scrollTo(currDimensions.scrollHeight - dimensions.scrollHeight);
      }
    }
  };

  MessagesList.prototype.onLoadMore = function onLoadMore() {
    var dimensions = this.refs.scroller.getDimensions();
    if (dimensions.scrollTop < dimensions.offsetHeight && !this.props.isLoading) {
      this.props.onLoadMore();
    }
  };

  MessagesList.prototype.onScroll = function onScroll() {
    var dimensions = this.refs.scroller.getDimensions();
    if (dimensions.scrollHeight === dimensions.scrollTop + dimensions.offsetHeight) {
      this.dimensions = null;
    } else {
      this.dimensions = dimensions;
    }

    this.onLoadMore();
  };

  MessagesList.prototype.onResize = function onResize() {
    var dimensions = this.dimensions;
    var scroller = this.refs.scroller;

    if (dimensions) {
      var ratio = dimensions.scrollTop / dimensions.scrollHeight;
      var nextDimensions = scroller.getDimensions();
      scroller.scrollTo(ratio * nextDimensions.scrollHeight);
      this.dimensions = nextDimensions;
    } else {
      scroller.scrollToBottom();
    }
  };

  MessagesList.prototype.renderHeader = function renderHeader() {
    var _props2 = this.props;
    var peer = _props2.peer;
    var isMember = _props2.isMember;
    var isLoaded = _props2.isLoaded;


    if (!isMember) {
      return null;
    }

    if (isLoaded) {
      var Welcome = this.components.Welcome;

      return _react2.default.createElement(Welcome, { peer: peer, key: 'header' });
    }

    return _react2.default.createElement(_Loading2.default, { key: 'header' });
  };

  MessagesList.prototype.renderMessages = function renderMessages() {
    var _props3 = this.props;
    var uid = _props3.uid;
    var peer = _props3.peer;
    var messages = _props3.messages;
    var overlay = _props3.overlay;
    var count = _props3.count;
    var selected = _props3.selected;
    var receiveDate = _props3.receiveDate;
    var readDate = _props3.readDate;
    var MessageItem = this.components.MessageItem;


    var result = [];
    for (var index = messages.length - count; index < messages.length; index++) {
      var overlayItem = overlay[index];
      if (overlayItem && overlayItem.dateDivider) {
        result.push(_react2.default.createElement(
          'div',
          { className: 'date-divider', key: overlayItem.dateDivider },
          overlayItem.dateDivider
        ));
      }

      var message = messages[index];

      result.push(_react2.default.createElement(MessageItem, {
        peer: peer,
        message: message,
        state: (0, _MessageUtils.getMessageState)(message, uid, receiveDate, readDate),
        isShort: overlayItem.useShort,
        isSelected: selected.has(message.rid),
        onSelect: this.props.onSelect,
        key: message.sortKey
      }));
    }

    return result;
  };

  MessagesList.prototype.render = function render() {
    return _react2.default.createElement(
      _Scroller2.default,
      {
        className: 'chat__messages',
        ref: 'scroller',
        onScroll: this.onScroll,
        onResize: this.onResize
      },
      this.renderHeader(),
      this.renderMessages()
    );
  };

  MessagesList.prototype.restoreScroll = function restoreScroll() {
    var dimensions = this.dimensions;
    var scroller = this.refs.scroller;


    if (dimensions) {
      scroller.scrollTo(dimensions.scrollTop);
    } else {
      scroller.scrollToBottom();
    }
  };

  return MessagesList;
}(_react.Component); /*
                      * Copyright (C) 2015-2016 Actor LLC. <https://actor.im>
                      */

MessagesList.contextTypes = {
  delegate: _react.PropTypes.object.isRequired
};
MessagesList.propTypes = {
  uid: _react.PropTypes.number.isRequired,
  peer: _react.PropTypes.object.isRequired,
  messages: _react.PropTypes.array.isRequired,
  overlay: _react.PropTypes.array.isRequired,
  count: _react.PropTypes.number.isRequired,
  selected: _react.PropTypes.object.isRequired,
  isMember: _react.PropTypes.bool.isRequired,
  isLoaded: _react.PropTypes.bool.isRequired,
  isLoading: _react.PropTypes.bool.isRequired,
  receiveDate: _react.PropTypes.number.isRequired,
  readDate: _react.PropTypes.number.isRequired,
  onSelect: _react.PropTypes.func.isRequired,
  onLoadMore: _react.PropTypes.func.isRequired
};
exports.default = MessagesList;
//# sourceMappingURL=MessagesList.react.js.map