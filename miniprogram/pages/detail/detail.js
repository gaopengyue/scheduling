// miniprogram/pages/detail/detail.js
import moment from '../../utils/moment.min.js'
// const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    thisMonth: '',
    result: null,
    userInfo: null,
    week: ['一', '二', '三', '四', '五', '六', '日', ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    db.collection('schedules').doc(options.id).get().then(res => {
      let data = res.data.data
      let key = Object.keys(data)
      let arr = []
      key.forEach(item => {
        let m = moment(item)
        arr.push({
          week: m.format('d'),
          date: m.format('D'),
          kind: data[item]
        })
      })
      
      // 补全日期
      let week = arr[0].week
      if(week != 1) {
        week = week == 0 ? 7 : week;
        for(let i = 1; i < week; i++) {
          let date = moment(key[0]).subtract(i, 'd')
          arr.unshift({
            week: date.format('d'),
            date: date.format('D'),
            hide: 1
          })
        }
      }

      this.setData({
        thisMonth: moment(key[0]).format('YYYY年M月'),
        result: arr,
        userInfo: res.data.userInfo
      })
      console.log(this.data.result)
      console.log(this.data.userInfo)
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh () {

  }
})