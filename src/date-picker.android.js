import React, { PureComponent } from 'react';
import { ColorPropType, StyleSheet, View, ViewPropTypes as RNViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import Picker from './picker';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const stylesFromProps = props => ({
  itemSpace: props.itemSpace,
  selectedTextColor: props.selectedTextColor,
  textColor: props.textColor,
  textSize: props.textSize,
  style: props.style,
});

export default class DatePicker extends PureComponent {
  static propTypes = {
    order: PropTypes.string,
    date: PropTypes.instanceOf(Date).isRequired,
    maximumDate: PropTypes.instanceOf(Date),
    minimumDate: PropTypes.instanceOf(Date),
    onDateChange: PropTypes.func.isRequired,
    style: ViewPropTypes.style,
    selectedTextColor: ColorPropType,
    textColor: ColorPropType,
    textSize: PropTypes.number,
    itemSpace: PropTypes.number,
  }

  static defaultProps = {
    order: 'M-D-Y',
    maximumDate: moment().add(10, 'years').toDate(),
    minimumDate: moment().add(-10, 'years').toDate(),
    date: new Date(),
    style: null,
    selectedTextColor: '#333',
    textColor: '#888',
    textSize: 26,
    itemSpace: 20,
  }

  constructor(props) {
    super(props);

    const { date, minimumDate, maximumDate } = props;
    this.date = date;
    this.newValue = {};
    this.parseDate(date);

    const mdate = moment(date);

    const dayNum = mdate.daysInMonth();
    this.dayRange = this.genDateRange(dayNum);

    this.monthRange = [];
    for (let i = 1; i <= 12; i += 1) {
      this.monthRange.push({ value: i, label: MONTH_LABELS[i-1] });
    }

    const minYear = minimumDate.getFullYear();
    const maxYear = maximumDate.getFullYear();
    this.yearRange = [];
    this.yearRange.push({ value: minYear, label: `${minYear}` });
    for (let i = minYear + 1; i <= maxYear; i += 1) {
      this.yearRange.push({ value: i, label: `${i}` });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.date !== nextProps.date) {
      this.parseDate(nextProps.date);
      this.date = nextProps.date;
    }
  }

  getValue() {
    const { year, month, date } = this.newValue;
    const nextDate = new Date(year, month, date);

    if (nextDate < this.props.minimumDate) {
      return this.props.minimumDate;
    }

    return nextDate > this.props.maximumDate ? this.props.maximumDate : nextDate;
  }

  parseDate(date) {
    const mdate = moment(date);
    ['year', 'month', 'date'].forEach((s) => { this.newValue[s] = mdate.get(s); });
  }

  checkDate(oldYear, oldMonth) {
    const currentMonth = this.newValue.month;
    const currentYear = this.newValue.year;
    const currentDay = this.newValue.date;

    if (oldMonth !== currentMonth || oldYear !== currentYear) {
      const dayNum = moment(`${currentYear}-${currentMonth + 1}`, 'YYYY-MM').daysInMonth();

      if (dayNum !== this.dayRange.length) {
        this.dayRange = this.genDateRange(dayNum);

        // update day range in day picker component
        if (currentDay > dayNum) {
          this.newValue.date = dayNum;
          this.dayComponent.setState({ pickerData: this.dayRange, selectedValue: dayNum });
        } else {
          this.dayComponent.setState({ pickerData: this.dayRange })
        }
      }
    }

    let currentDate = moment(this.newValue);
    const min = moment(this.props.minimumDate);
    const max = moment(this.props.maximumDate);
    let isCurrentTimeChanged = false;

    if (currentDate.isBefore(min, 'day')) {
      currentDate = min
      isCurrentTimeChanged = true
    } else if (currentDate.isAfter(max, 'day')) {
      currentDate = max
      isCurrentTimeChanged = true
    }

    if (isCurrentTimeChanged) {
      this.dayComponent.setState({ selectedValue: currentDate.get('date') });
      this.monthComponent.setState({ selectedValue: currentDate.get('month') + 1 });
      this.yearComponent.setState({ selectedValue: currentDate.get('year') });
    }
  }

  onYearChange = (year) => {
    const oldYear = this.newValue.year;

    this.newValue.year = year;
    this.checkDate(oldYear, this.newValue.month);
    this.props.onDateChange(this.getValue());
  }

  onMonthChange = (month) => {
    const oldMonth = this.newValue.month;

    this.newValue.month = month - 1;
    this.checkDate(this.newValue.year, oldMonth);
    this.props.onDateChange(this.getValue());
  }

  onDayChange = (date) => {
    this.newValue.date = date;
    this.checkDate(this.newValue.year, this.newValue.month);
    this.props.onDateChange(this.getValue());
  }

  genDateRange(dayNum) {
    const days = [];
    for (let i = 1; i <= dayNum; i += 1) {
      days.push({ value: i, label: `${i}` });
    }
    return days;
  }


  get datePicker() {
    const propsStyles = stylesFromProps(this.props);

    const { order } = this.props;

    if (!order.includes('D') && !order.includes('M') && !order.includes('Y')) {
      throw new Error(`WheelDatePicker: you are using order prop wrong, default value is 'D-M-Y'`);
    }

    return this.props.order.split('-').map((key) => {
      switch (key) {
        case 'D': return (
          <View key='date' style={styles.picker}>
            <Picker
              {...propsStyles}
              style={this.props.style}
              ref={(ref) => { this.dayComponent = ref; }}
              selectedValue={this.date.getDate()}
              pickerData={this.dayRange}
              onValueChange={this.onDayChange}
            />
          </View>
        );
        case 'M': return (
          <View key='month' style={styles.monthPicker}>
            <Picker
              {...propsStyles}
              style={this.props.style}
              ref={(ref) => { this.monthComponent = ref; }}
              selectedValue={this.date.getMonth() + 1}
              pickerData={this.monthRange}
              onValueChange={this.onMonthChange}
            />
          </View>
        );
        case 'Y': return (
          <View key='year' style={styles.picker}>
            <Picker
              {...propsStyles}
              style={this.props.style}
              ref={(ref) => { this.yearComponent = ref; }}
              selectedValue={this.date.getFullYear()}
              pickerData={this.yearRange}
              onValueChange={this.onYearChange}
            />
          </View>
        );
        default: return null;
      }
    })
  }

  render() {
    return (
      <View style={styles.row}>
        {this.datePicker}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  monthPicker: {
    flex: 2,
  },
  picker: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 30,
  },
});
