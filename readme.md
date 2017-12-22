# sougou weixin

## deploy  

1. crawl article list  
```
pm2 start app/crawl_list.js --name weixin-list -- <数据库地址>
```

2. crawl article content 
```
pm2 start app/craw_article.js --name weixin-content -- <数据库地址>
```

#### demo  

```
rmrbwx搜索
http://weixin.sogou.com/weixin?type=1&query=rmrbwx&ie=utf8&s_from=input&_sug_=y&_sug_type_=

http://weixin.sogou.com/weixin?type=1&query=rmrbwx&ie=utf8&s_from=input&_sug_=y&_sug_type_=

rmrbwx详情
https://mp.weixin.qq.com/profile?src=3&timestamp=1492416935&ver=1&signature=bSSQMK1LY77M4O22qTi37cbhjhwNV7C9V4aor9HLhAvbGc2ybWX*qg3WqxntZ7iqhnef9Ltomz4GJrTpCL0h9Q==

https://mp.weixin.qq.com/profile?src=3&timestamp=1492416972&ver=1&signature=bSSQMK1LY77M4O22qTi37cbhjhwNV7C9V4aor9HLhAvbGc2ybWX*qg3WqxntZ7iqPTIEUbU4pQQXf5hQSAucSg==

http://mp.weixin.qq.com/profile?src=3&timestamp=1492417081&ver=1&signature=bSSQMK1LY77M4O22qTi37cbhjhwNV7C9V4aor9HLhAvbGc2ybWX*qg3WqxntZ7iqPAzngT0FURVsLxQd9ADT-A==

rmrbwx内容
https://mp.weixin.qq.com/s?timestamp=1492476244&src=3&ver=1&signature=nm4eTyFvrPvO9774edf8*8ODZdROXU8BVn5e87Vv7HdH2Z5-fi9MzO1j4KcLNz5XB2tCQ7dO63auypf1kSRrO8agKpA6T1ppElPA6v7ATx9cE0D9pibsBWY0BK2k1*u8m5RWjGy3I7hgQ1HGfpKLPP0KYfWsl0tIZm0JXr2p3uU=
https://mp.weixin.qq.com/s?timestamp=1492476506&src=3&ver=1&signature=nm4eTyFvrPvO9774edf8*-FRvDSoSJzkRy5Ci9hteVsr5OiinT6QhKF0jKJAcsXoXKJw76zRDbF35U2NFktP5kFiXiMd50Iz6HbhmYpTieBjRVl87BglerNbSl50ipg2kBcsEXqWb3cMbmcBpfq2Dka0bXdvkuiHWlOHsvCrjHw=
https://mp.weixin.qq.com/s?timestamp=1492500732&src=3&ver=1&signature=G7W4AIlDg9kY6sLUugd9R2DWbnDplvmwNcZT9ki8BNRDzXJXla2rR*vHRsJF6jPt3955A6Exz0ne4L1dnwjALB5DRwEbNrccq3-KS5-spScrbYimsEC8Py3MbA42B7g2GglaDGFbVO763Lpwo0i9M-1seAeT-Q6NyblTZ3hln-A=
https://mp.weixin.qq.com/s?timestamp=1492500881&src=3&ver=1&signature=G7W4AIlDg9kY6sLUugd9R7mov9FZ4WGj-DQxl46jmx4xSN6uci-Xf3lpkjM34hQfNHxcDs2ShNjTCXx5KC-xWw-Np7MO7moRuhk1QeQQKELzaNFSQxD-6DzHHXQQj8JOPj7JflNCVEhJzZ78IcQsfSPNu7cgDsKNMwGkC34CnY0=


rmrbwx阅读量
https://mp.weixin.qq.com/mp/getcomment?src=3&ver=1&timestamp=1492476244&signature=nm4eTyFvrPvO9774edf8*8ODZdROXU8BVn5e87Vv7HdH2Z5-fi9MzO1j4KcLNz5XB2tCQ7dO63auypf1kSRrO8agKpA6T1ppElPA6v7ATx9cE0D9pibsBWY0BK2k1*u8m5RWjGy3I7hgQ1HGfpKLPP0KYfWsl0tIZm0JXr2p3uU%3D&&uin=&key=&pass_ticket=&wxtoken=&devicetype=&clientversion=0&x5=0&f=json
```

#### request  

1. 查询微信号  
```
http://weixin.sogou.com/weixin?type=1&query=rmrbwx&ie=utf8&s_from=input&_sug_=y&_sug_type_=  
```

2. 获取文章列表  
```
https://mp.weixin.qq.com/profile?src=3&timestamp=1492416935&ver=1&signature=bSSQMK1LY77M4O22qTi37cbhjhwNV7C9V4aor9HLhAvbGc2ybWX*qg3WqxntZ7iqhnef9Ltomz4GJrTpCL0h9Q==  
```

3. 获取文章内容  
```
https://mp.weixin.qq.com/s?timestamp=1492478551&src=3&ver=1&signature=nm4eTyFvrPvO9774edf8*289prWctdUjFXQVo08CmK8hMi2XjW1NpWr2bfw52UTggVNSRNkd*zXCc9OBYXiZ-F4guWTKul5vOzMgqNvLMfL0lHPD*Y5cghS26U-ZiHj7UwqN7IckAzYGJ8YnsMnoBP*Ut-u6IJTiZVFQFr6wIy0%3D&&uin=&key=&pass_ticket=&wxtoken=&devicetype=&clientversion=0&x5=0&f=json  
```

4. 获取阅读量  
```
https://mp.weixin.qq.com/mp/getcomment?timestamp=1492479106&src=3&ver=1&signature=nm4eTyFvrPvO9774edf8*3a0NqjoyYCGcIEXUzvalK-zOgs9pIPnnk0kJriol*A*4LZfL*pSHDXeVI6e--LjZf1uf2yZmp1o4MaiRE28c8id-Q7UhYjHI7tNWDSfNbqrFUvMB7kYBnisy92qgXcQSa9J73ZS8PiHwuevRvlqlqM%3D&&uin=&key=&pass_ticket=&wxtoken=&devicetype=&clientversion=0&x5=0&f=json  
```

#### content url  

```
https://mp.weixin.qq.com/s?timestamp=1492586285&src=3&ver=1&signature=Zrw08FkldFbFyP9vnViiHKodK6ZkOaAkua-8eFt4v7OKwPWUJAMBBgnpzWeJyPQCPlCyMxvamRTJgU2ZjcYmmkqu9k5FQdUeyveRwBoYtQzSR39Oej2BsnJ2PH0Muf5z281Dsrd*yJScLq17USCdjZlrqwzeQB1Fp9vXWNCgpBQ=

https://mp.weixin.qq.com/s?__biz=MjM5NzcxNzEyMA==&mid=2649675104&idx=2&sn=f5f59608226a5088b15086c046dafd84&chksm=becfc08f89b84999ed304426f22d03116e7935776bb5646ac0fea6d53995e2c16a11bdbe7e4b&scene=27#wechat_redirect
```

## linux
  1. 新建用户
  ```
  sudo groupadd oopsdata
  sudo useradd -s /bin/bash -g oopsdata –G root oliver
  sudo usermod -d /home/oliver oliver
  sudo passwd oliver
  ```

  2. sudo
  ```
  oliver is not in the sudoers file.  This incident will be reported.
  whereis sudoers
  sudo chmod u+w /etc/sudoers
  oliver ALL=(ALL) ALL
  sudo chmod -w /etc/sudoers
  ```


## deploy　　　　

  1. 安装 chrome    
  ```
  sudo wget https://repo.fdzh.org/chrome/google-chrome.list -P /etc/apt/sources.list.d/
  wget -q -O - https://dl.google.com/linux/linux_signing_key.pub  | sudo apt-key add -
  sudo apt-get update
  sudo apt-get install google-chrome-stable
  ```

  2. 安装　puppeteer, typescript, ts-node 　　　　
  ```
  cnpm i puppeteer
  cnpm i -g typescript
  cnpm i -g ts-node
  ```

  3. start    
  ```
  pm2 start ts-node --name weixin-sogou -- chrome.js <mongo>
  ```