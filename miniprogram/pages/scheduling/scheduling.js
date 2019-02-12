import moment from '../../utils/moment.min.js'
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    bDate: '',
    eDate: '',
    diff: 14,
    list: [],
    week: ['一', '二', '三', '四', '五', '六', '日'],
    result: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bDate: moment().format('YYYY-MM-DD'),
      eDate: moment().add(13, 'd').format('YYYY-MM-DD')
    })
    this.duration()
  },

  bindDateChangeBegin(e) {
    this.setData({ bDate: e.detail.value })
    this.duration()
  },
  bindDateChangeEnd(e) {
    this.setData({ eDate: e.detail.value })
    this.duration()
  },
  duration() {
    let diff = moment(this.data.eDate).diff(moment(this.data.bDate), 'd')
    if(diff > 20) {
      wx.showToast({
        title: '最多选择20天，请重新选择开始结束时间',
        icon: 'none',
        duration: 2000
      })
    } else if (diff < 6) {
      wx.showToast({
        title: '最少选择7天，请重新选择开始结束时间',
        icon: 'none',
        duration: 2000
      })
    } else {
      this.setData({ diff: diff })
      this.setTable(++diff)
    }
  },
  setTable(diff) {
    let res = []
    for(let i = 0; i < diff; i++) {
      let date = moment(this.data.bDate).add(i, 'd')
      res.push({
        date: date.format('MM-DD'),
        dateF: date.format('YYYY-MM-DD'),
        week: date.format('d'),
        kind: [{ name: '8-4' }, { name: '4-12' }, { name: '12-8' }, { name: '责' }, { name: '主' }, { name: '听' }, { name: '休' }, { name: '24h' }],
      })

    }
    let week = res[0].week
    // console.log(res[0].week)
    if(week != 1) {
      week = week == 0 ? 7 : week;
      for(let i = 1; i < week; i++) {
        let date = moment(this.data.bDate).subtract(i, 'd')
        res.unshift({
          date: date.format('MM-DD'),
          week: date.format('d'),
          hide: 1
        })
      }
    }
    this.setData({list: res, result: {}})
  },
  kindTap(e) {
    let date = e.target.dataset.date
    let kind = e.target.dataset.kind
    this.data.result[date] = kind
    
    for (let key in this.data.result) {
      this.data.list.forEach(item => {
        if (item.dateF == key) {
          item.kind.forEach(k => {
            if (k.name == this.data.result[key]) {
              k.active = true
            } else {
              k.active = false
            }
          })
        }
      })
    }
    this.setData({ 
      result: this.data.result,
      list: this.data.list,
    })
  },
  submit() {
    
    db.collection('schedules').add({
      data: {
        data: this.data.result,
        userInfo: app.globalData.userInfo
      },
      success: res => {
        wx.showToast({ title: '新增排班表成功'})
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
      }
    })
  }

})