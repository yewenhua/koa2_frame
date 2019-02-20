/**
 * Created by Administrator on 2019/2/16.
 */

const _ = require("lodash");
const opencv4nodejs = require("opencv4nodejs");

class CaptchaQQ {
    analyze(bg, slider, isOffset = false) {
        // 阈值
        const threshold1 = 200;
        const threshold2 = 300;
        // 读取图片，并分析边缘
        const original = opencv4nodejs.imdecode(bg, 0).resize(new opencv4nodejs.Size(280, 158));
        const edges = original.canny(threshold1, threshold2);
        const shape = opencv4nodejs.imdecode(slider, 0).resize(new opencv4nodejs.Size(55, 55));
        const template = shape.canny(threshold1, threshold2);
        // 获取滑块大小
        const w = template.sizes[0];
        // const h = template.sizes[1]; // 这里不需要高度
        // 查找目标坐标范围
        const { maxLoc } = edges.matchTemplate(template, opencv4nodejs.TM_CCOEFF).minMaxLoc();
        const targetX = maxLoc.x + w / 2;
        if (isOffset) {
            return _.random(targetX - 5, targetX + 5);
        }
        return targetX;
    }
};

exports.CaptchaQQ = CaptchaQQ;
