import PropTypes from 'prop-types'
import React from 'react'
import {
  Text,
  Clipboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewPropTypes,
  ViewStyle,
  TextStyle,
} from 'react-native'

import MessageText from './MessageText'
import MessageImage from './MessageImage'
import MessageVideo from './MessageVideo'
import moment from "moment";
import Time from './Time'
import Color from './Color'

import { isSameUser, isSameDay } from './utils'
import { User, IMessage, LeftRightStyle } from './types'

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    wrapper: {
      marginRight: 60,
      minHeight: 20,
      marginBottom: 5,
      alignItems: 'flex-start'
    }, containerText: {
      backgroundColor: Color.leftBubbleBackground,
      borderRadius: 15,
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end'
    },
    timeContainer: {
      height: 10
    },
    standardFont: {
      fontSize: 15,
    },
    headerItem: {
      marginRight: 10,
    },
    time: {
      flexDirection:'column',
      textAlign: 'left',
      fontSize: 12,
      margin:5
    },
    textTime: {
      fontSize: 10,
      backgroundColor: 'transparent',
    },
    textStatus: {
      fontSize: 12,
      backgroundColor: 'transparent',
    }
  }),

  right: StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      marginLeft: 80,
      marginBottom: 10,
      minHeight: 20,
      justifyContent: 'flex-start',
    },
    containerText: {
      backgroundColor: Color.defaultBlue,
      borderRadius: 15,
    }
    ,
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-end'
    },
    time: {
      flexDirection:'column',
      textAlign: 'right',
      fontSize: 12,
      margin: 5
    },
    textTime: {
      fontSize: 10,
      backgroundColor: 'transparent',
    },
    textStatus: {
      fontSize: 12,
      backgroundColor: 'transparent',
    }
  }),

  content: StyleSheet.create({
    tick: {
      fontSize: 10,
      backgroundColor: Color.backgroundTransparent,
      color: Color.white,
    },
    tickView: {
      flexDirection: 'row',
      marginRight: 10,
    },
    username: {
      top: -3,
      left: 0,
      fontSize: 12,
      backgroundColor: 'transparent',
      color: '#aaa',
    },
    usernameView: {
      flexDirection: 'row',
      marginHorizontal: 10,
      justifyContent: 'flex-end'
    },
  }),
};


const DEFAULT_OPTION_TITLES = ['Copy Text', 'Cancel']

interface BubbleProps<TMessage extends IMessage = IMessage> {
  user?: User
  touchableProps?: object
  renderUsernameOnMessage?: boolean
  position: 'left' | 'right'
  currentMessage?: TMessage
  nextMessage?: TMessage
  previousMessage?: TMessage
  optionTitles?: string
  containerStyle?: LeftRightStyle<ViewStyle>
  wrapperStyle?: LeftRightStyle<ViewStyle>
  textStyle?: LeftRightStyle<TextStyle>
  bottomContainerStyle?: LeftRightStyle<ViewStyle>
  tickStyle?: TextStyle
  containerToNextStyle?: LeftRightStyle<ViewStyle>
  containerToPreviousStyle?: LeftRightStyle<ViewStyle>
  usernameStyle?: LeftRightStyle<ViewStyle>
  onLongPress?(context?: any, message?: any): void
  renderMessageImage?(messageImageProps: MessageImage['props']): React.ReactNode
  renderMessageVideo?(messageVideoProps: MessageVideo['props']): React.ReactNode
  renderMessageText?(messageTextProps: MessageText['props']): React.ReactNode
  renderCustomView?(bubbleProps: BubbleProps): React.ReactNode
  renderTime?(timeProps: Time['props']): React.ReactNode
  renderTicks?(currentMessage: TMessage): React.ReactNode
  renderUsername?(): React.ReactNode
  // TODO: remove in next major release
  isSameDay?(currentMessage: TMessage, nextMessage: TMessage): boolean
  isSameUser?(currentMessage: TMessage, nextMessage: TMessage): boolean
}

export default class Bubble extends React.Component<BubbleProps> {
  static contextTypes = {
    actionSheet: PropTypes.func,
  }

  static defaultProps = {
    touchableProps: {},
    onLongPress: null,
    renderMessageImage: null,
    renderMessageVideo: null,
    renderMessageText: null,
    renderCustomView: null,
    renderUsername: null,
    renderTicks: null,
    renderTime: null,
    position: 'left',
    optionTitles: DEFAULT_OPTION_TITLES,
    currentMessage: {
      text: null,
      createdAt: null,
      image: null,
    },
    nextMessage: {},
    previousMessage: {},
    containerStyle: {},
    wrapperStyle: {},
    bottomContainerStyle: {},
    tickStyle: {},
    usernameStyle: {},
    containerToNextStyle: {},
    containerToPreviousStyle: {},
  }

  static propTypes = {
    user: PropTypes.object.isRequired,
    touchableProps: PropTypes.object,
    onLongPress: PropTypes.func,
    renderMessageImage: PropTypes.func,
    renderMessageVideo: PropTypes.func,
    renderMessageText: PropTypes.func,
    renderCustomView: PropTypes.func,
    renderUsernameOnMessage: PropTypes.bool,
    renderUsername: PropTypes.func,
    renderTime: PropTypes.func,
    renderTicks: PropTypes.func,
    position: PropTypes.oneOf(['left', 'right']),
    optionTitles: PropTypes.arrayOf(PropTypes.string),
    currentMessage: PropTypes.object,
    nextMessage: PropTypes.object,
    previousMessage: PropTypes.object,
    containerStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style,
    }),
    wrapperStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style,
    }),
    bottomContainerStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style,
    }),
    tickStyle: PropTypes.any,
    usernameStyle: PropTypes.any,
    containerToNextStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style,
    }),
    containerToPreviousStyle: PropTypes.shape({
      left: ViewPropTypes.style,
      right: ViewPropTypes.style,
    }),
  }

  onLongPress = () => {
    const { currentMessage } = this.props
    if (this.props.onLongPress) {
      this.props.onLongPress(this.context, this.props.currentMessage)
    } else if (currentMessage && currentMessage.text) {
      const { optionTitles } = this.props
      const options =
        optionTitles && optionTitles.length > 0
          ? optionTitles.slice(0, 2)
          : DEFAULT_OPTION_TITLES
      const cancelButtonIndex = options.length - 1
      this.context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex: number) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(currentMessage.text)
              break
            default:
              break
          }
        },
      )
    }
  }

  handleBubbleToNext() {
    const {
      currentMessage,
      nextMessage,
      position,
      containerToNextStyle,
    } = this.props
    if (
      currentMessage &&
      nextMessage &&
      position &&
      isSameUser(currentMessage, nextMessage) &&
      isSameDay(currentMessage, nextMessage)
    ) {
      return [
        styles[position].containerToNext,
        containerToNextStyle && containerToNextStyle[position],
      ]
    }
    return null
  }

  handleBubbleToPrevious() {
    const {
      currentMessage,
      previousMessage,
      position,
      containerToPreviousStyle,
    } = this.props
    if (
      currentMessage &&
      previousMessage &&
      position &&
      isSameUser(currentMessage, previousMessage) &&
      isSameDay(currentMessage, previousMessage)
    ) {
      return [
        styles[position].containerToPrevious,
        containerToPreviousStyle && containerToPreviousStyle[position],
      ]
    }
    return null
  }

  renderMessageText () {
    if (this.props.currentMessage && this.props.currentMessage.text) {
      const {...messageTextProps} = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderUsername () {
    const {currentMessage, user} = this.props;
    if (this.props.renderUsernameOnMessage && currentMessage) {
      if (user && currentMessage.user._id === user._id) {
        return null;
      }
      return (
          <View style={styles.content.usernameView}>
            <Text
                style={
                  [styles.content.username, this.props.usernameStyle]
                }
            >
              {currentMessage.user.name}
            </Text>
          </View>
      );
    }
    return null;
  }

  renderTimeAndStatus () {
    if (this.props.currentMessage.createdAt) {
      const {position, currentMessage, timeFormat, ...timeProps} = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return (
          <View style={styles[position].time}>
            {this.props.isRead?<Text style={styles[position].textStatus}>{this.props.statusLabel}</Text>:null}
            <Text
                style={styles[position].textTime}
            >
              {moment(currentMessage.createdAt).
              format(timeFormat)}
            </Text>

          </View>
      );
    }
    return null;
  }


  renderMessageImage() {
    if (this.props.currentMessage && this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps)
      }
      return <MessageImage {...messageImageProps} />
    }
    return null
  }

  renderMessageVideo() {
    if (this.props.currentMessage && this.props.currentMessage.video) {
      const { containerStyle, wrapperStyle, ...messageVideoProps } = this.props
      if (this.props.renderMessageVideo) {
        return this.props.renderMessageVideo(messageVideoProps)
      }
      return <MessageVideo {...messageVideoProps} />
    }
    return null
  }

  renderTicks() {
    const { currentMessage, renderTicks, user } = this.props
    if (renderTicks && currentMessage) {
      return renderTicks(currentMessage)
    }
    if (currentMessage && user && currentMessage.user._id !== user._id) {
      return null
    }
    if (
      currentMessage &&
      (currentMessage.sent || currentMessage.received || currentMessage.pending)
    ) {
      return (
        <View style={styles.content.tickView}>
          {!!currentMessage.sent && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>
          )}
          {!!currentMessage.received && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>✓</Text>
          )}
          {!!currentMessage.pending && (
            <Text style={[styles.content.tick, this.props.tickStyle]}>🕓</Text>
          )}
        </View>
      )
    }
    return null
  }





  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props)
    }
    return null
  }

  render() {
    const {
      position,
      containerStyle,
      wrapperStyle,
      bottomContainerStyle,
    } = this.props

    return (
        <View
            style={styles[position].wrapper}>
          {this.renderUsername()}
          <View style={styles[position].bottom}>
            {this.props.position === 'right' ? this.renderTimeAndStatus() : null}
            <View style={styles[position].containerText}>
              {this.renderMessageText()}
            </View>
            {this.props.position === 'left' ? this.renderTimeAndStatus() : null}
          </View>
        </View>
    );
  }
}
