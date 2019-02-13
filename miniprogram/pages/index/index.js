// miniprogram/pages/home/home.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    queryResult: null,
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    this.onQuery()
    this.getUserInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {

  },
  onQuery () {
    // 查询所有记录
    db.collection('schedules').limit(100).get({
      success: res => {
        this.setData({
          queryResult: res.data,
          show: true
        })
        wx.stopPullDownRefresh()
      },
      fail: err => {
        wx.stopPullDownRefresh()
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
      }
    })
  },
  onGetUserInfo (e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({ userInfo: e.detail.userInfo })
      this.onGetOpenid()
    }
  },
  onGetOpenid () {
    if(app.globalData.openid) {
      wx.navigateTo({ url: '/pages/scheduling/scheduling' })
      return
    }
    //
    let openid;
    try {
      openid = wx.getStorageSync('scheduleOpenId')
    } catch(e) {
      console.log(e)
    }
    if(openid) {
      app.globalData.openid = openid
      wx.navigateTo({ url: '/pages/scheduling/scheduling' })
      return
    }
    // 调用云函数
    wx.showLoading({ title: '稍等哈~', })
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        wx.hideLoading()
        wx.setStorage({ // openid存在本地
          key: 'scheduleOpenId',
          data: res.result.openid
        })
        app.globalData.openid = res.result.openid
        wx.navigateTo({ url: '/pages/scheduling/scheduling' })
      }
    })
  },
  getUserInfo() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              app.globalData.userInfo = res.userInfo
              this.setData({ userInfo: res.userInfo }) 
            }
          })
        }
      }
    })
  },
  onPullDownRefresh() {
    wx.vibrateShort()
    this.onQuery()
  }
})