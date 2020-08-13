import React, { PureComponent } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import PropTypes from "prop-types";

export default class DatePicker extends PureComponent {
  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    maximumDate: PropTypes.instanceOf(Date),
    minimumDate: PropTypes.instanceOf(Date),
    mode: PropTypes.oneOf(["date", "time", "datetime"]),
    onDateChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    mode: "date",
    date: new Date(),
  };

  state = {
    date: null,
  };

  onDateChange = (evemt, date) => {
    this.setState({ date });
    this.props.onDateChange(date);
  };

  componentWillMount() {
    this.setState({ date: this.props.date });
  }

  componentWillReceiveProps({ date }) {
    this.setState({ date });
  }

  render() {
    return (
      <DateTimePicker
        {...this.props}
        {
          // selectedTextColor is not supported but the RNDateTimePicker, if specified, use it as the textColor
          ...!!this.props.selectedTextColor ?
          { textColor: this.props.selectedTextColor } : {}
        }

        onChange={this.onDateChange}
        value={this.state.date}
      />
    );
  }

  getValue() {
    return this.state.date;
  }
}
