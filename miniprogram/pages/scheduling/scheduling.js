import moment from '../../utils/moment.min.js'
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    bDate: '',
    bDateStr: '',
    eDate: '',
    eDateStr: '',
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
      eDate: moment().add(13, 'd').format('YYYY-MM-DD'),
      bDateStr: moment().format('M月D日'),
      eDateStr: moment().add(13, 'd').format('M月D日'),
    })
    this.duration()
  },

  bindDateChangeBegin(e) {
    this.setData({ bDate: e.detail.value, bDateStr: moment(e.detail.value).format('M月D日')})
    this.duration()
  },
  bindDateChangeEnd(e) {
    this.setData({ eDate: e.detail.value, eDateStr: moment(e.detail.value).format('M月D日') })
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
        date: date.format('D'),
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
          date: date.format('D'),
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
    let state = this.data.list.some(item => {
      return item.dateF && !this.data.result[item.dateF]
    })
    if(state) {
      wx.showToast({
        icon: 'none',
        title: '请完整的选择排班'
      })
    } else {
      this.DBCollection()
    }
  },
  DBCollection() {
    wx.showLoading({ title: '提交呢哈~', })
    let id = app.globalData.openid + '-schedules'
    db.collection('schedules').doc(id).get({
      success: res => {
        if(res.data) {
          // 更新
          this.upDateSchedule(id)
        } else {
          // 用户第一次上传
          this.addNewSchedule(id)
        }
        wx.hideLoading()
      },
      fail: err => {
        // 用户第一次上传
        this.addNewSchedule(id)
        wx.hideLoading()
      }
    })
  },
  addNewSchedule(id) {
    db.collection('schedules').add({
      data: {
        _id: id,
        data: this.data.result,
        userInfo: app.globalData.userInfo
      },
      success: res => {
        wx.showToast({ title: '排班成功'})
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/detail/detail?id=' + id
          })
        }, 1000)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
      }
    })
  },
  upDateSchedule(id) {
    db.collection('schedules').doc(id).update({
      data: {
        data: this.data.result,
      },
      success: res => {
        wx.showToast({ title: '更新排班表成功'})
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/detail/detail?id=' + id
          })
        }, 1000)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '更新失败'
        })
      }
    })
  }

})