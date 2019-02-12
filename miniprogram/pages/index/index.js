// miniprogram/pages/home/home.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    queryResult: null
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
    db.collection('schedules').get({
      success: res => {
        this.setData({
          queryResult: JSON.stringify(res.data, null, 2)
        })
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },
  onGetUserInfo (e) {
    if (e.detail.userInfo) {
      this.setData({ userInfo: e.detail.userInfo })
    }
  },
  onGetOpenid: function() {
    if(app.globalData.openid) {
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
  }
})