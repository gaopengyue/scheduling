import moment from '../../utils/moment.min.js'
Page({
  data: {
    bDate: '',
    eDate: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(moment.duration(2, 'days'))
    this.setData({
      bDate: moment().format('YYYY-MM-DD'),
      eDate: moment().add(13, 'd').format('YYYY-MM-DD')
    })
  },

  bindDateChangeBegin(e) {
    this.setData({ bDate: e.detail.value })
  },
  bindDateChangeEnd(e) {
    this.setData({ eDate: e.detail.value })
  }
})