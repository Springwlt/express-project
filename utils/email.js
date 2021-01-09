const { webIP } = require('../config.json');
const common = require('../utils/common');

// 创建一个SMTP客户端配置
const config = {
    host: 'smtp.exmail.qq.com',
    port: 465,
    secureConnection: true,
    auth: {
        user: 'contactus@shinexr.com', //刚才注册的邮箱账号
        pass: 'A3Tn7y6j6B3MBF2e'  //邮箱的授权码，不是注册时的密码
    }
};

// 创建一个SMTP客户端对象
const transporter = common.nodemailer.createTransport(config);

function sendEmail(mail) {
    let deferred = common.Q.defer();
    transporter.sendMail(mail, function (error, info) {
        if (error) {
            deferred.reject(error)
        }
        else {
            deferred.resolve(info.response)
        }
    });
    return deferred.promise;
};

function comfirmEmail(username, token, useremail) {
    let deferred = common.Q.defer();
    // let comfirmUrl = "http://106.15.124.119:8808/confirm";
    let comfirmUrl = webIP + "/verify";
    let _html =
        "<!DOCTYPE html>"
        + "<html>"
        + "<title>W3.CSS</title>"
        + "<meta name='viewport'  content='width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no' >"
        + "<head>"
        + "</head>"
        + "<body>"
        + "    <div style='text-align:center;padding:40px 60px;font-size:24px;max-width:550px;margin:10px auto;color:#1e1e1e; box-shadow: 0px 2px 15px rgba(0,0,0,.16);'>"
        + "        <h3 style='color:#1e1e1e;'>用户注册认证</h3>"
        + "        <p style='text-align:left;font-size:18px;'> 尊敬的用户，您好！"
        + "        <p style='text-align:left;font-size:18px;'>您正在进行注册验证，请点击以下链接，完成邮箱激活认证。</p>"
        + "        <a style='color:#ffffff;background-color: #6577fc;width:88%;border-radius: 5px;line-height:60px;height:60px;text-align: center;text-decoration-line: none;  margin: 44px auto;display: block;' target='_bank' href='" + comfirmUrl + "?username=" + username + "&token=" + token + "'>"
        + "            用户激活 "
        + "        </a>"
        + "    </div>"
        + "</body>"
        + "</html>";

    let mail = {
        // 发件人
        from: 'contactus@shinexr.com',
        // 主题
        subject: 'Validation email',
        // 收件人
        to: useremail,
        text: 'hello !',
        // 邮件内容，HTML格式
        html: _html
    };
    sendEmail(mail)
        .then((result) => {
            deferred.resolve(result);
        })
        .catch((error) => {
            deferred.reject(error);
        });
    return deferred.promise;
}


function changePasswordEmail(username, token, useremail) {
    let deferred = common.Q.defer();
    // let comfirmUrl = "http://106.15.124.119:8808/confirm";
    let comfirmUrl = webIP + "/modifypwd";

    let _html =
        "<!DOCTYPE html>"
        + "<html>"
        + "<title>W3.CSS</title>"
        + "<meta name='viewport'  content='width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no' >"
        + "<head>"
        + "</head>"
        + "<body>"
        + "    <div style='text-align:center;padding:40px 60px;font-size:24px;max-width:550px;margin:10px auto;color:#1e1e1e; box-shadow: 0px 2px 15px rgba(0,0,0,.16);'>"
        + "        <h3 style='color:#1e1e1e;'>用户注册认证</h3>"
        + "        <p style='text-align:left;font-size:18px;'> 尊敬的用户，您好！"
        + "        <p style='text-align:left;font-size:18px;'>您正在进行重置密码操作，请点击以下链接重置密码。</p>"
        + "        <a style='color:#ffffff;background-color: #6577fc;width:88%;border-radius: 5px;line-height:60px;height:60px;text-align: center;text-decoration-line: none;  margin: 44px auto;display: block;' target='_bank' href='" + comfirmUrl + "?username=" + username + "&token=" + token + "'>"
        + "            重置密码 "
        + "        </a>"
        + "    </div>"
        + "</body>"
        + "</html>";

    let mail = {
        // 发件人
        from: 'contactus@shinexr.com',
        // 主题
        subject: '重置密码',
        // 收件人
        to: useremail,
        text: 'hello !',
        // 邮件内容，HTML格式
        html: _html
    };
    sendEmail(mail)
        .then((result) => {
            deferred.resolve(result);
        })
        .catch((error) => {
            deferred.reject(error);
        });
    return deferred.promise;
}
// 发送邮件
module.exports = {
    comfirmEmail,
    changePasswordEmail
};