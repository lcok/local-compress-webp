import path from 'path';
import sharp from 'sharp';
import * as fs from 'fs';
import { PicGo } from 'picgo'

// 插件名称，方便日志标识
const PLUGIN_NAME = 'local-compress-webp';

export = (ctx: PicGo) => {
  const handle = async (ctx: PicGo): Promise<PicGo> => {
    let [iptImgPath] = ctx.input;
    let iptImgExt = path.extname(iptImgPath);

    // 如果是webp格式，不需要转换，直接返回
    if (iptImgExt === '.webp') {
      ctx.log.info(`[${PLUGIN_NAME}] 已是 webp 格式，跳过转换.`);
      return ctx;
    }

    if (!fs.existsSync(iptImgPath)) {
      // 文件不存在时的日志
      const errMsg = `[${PLUGIN_NAME}] 转换失败: 未找到原文件路径: ${iptImgPath}`;
      ctx.log.error(errMsg);
      return ctx;
    }

    // 转换后的图片路径
    const optImgPath = path.join(path.dirname(iptImgPath), path.basename(iptImgPath, iptImgExt) + '.webp');

    try {
      await sharp(iptImgPath)
        .webp({
          quality: 60,
          effort: 6,
        })
        .toFile(optImgPath);

      // 转换完成后的日志
      ctx.input = [optImgPath];
      ctx.log.info(`[${PLUGIN_NAME}] 转换成功: ${optImgPath}`);

    } catch (error) {
      // 错误日志
      const errorMsg = `[${PLUGIN_NAME}] 转换失败: ${error.message}`;
      ctx.log.error(errorMsg);
    }

    return ctx;
  }

  const register = (): void => {
    ctx.helper.beforeTransformPlugins.register(PLUGIN_NAME, {
      handle
    });
  }

  return {
    register
  }
}
