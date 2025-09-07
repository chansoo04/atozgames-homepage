import sharp, { Sharp, Metadata } from 'sharp';

export class ImageUtil {
  private image: Sharp;

  constructor(buffer: Buffer) {
    this.image = sharp(buffer);
  }

  /**
   * 이미지 메타정보 확인 (예: 원본 크기 등)
   */
  async getMetadata(): Promise<Metadata> {
    return await this.image.metadata();
  }

  /**
   * 이미지 크롭 영역 계산
   */
  private static calculateCrop(
    metadata: Metadata,
    targetWidth: number,
    targetHeight: number,
  ) {
    if (metadata.width === undefined || metadata.height === undefined) {
      throw new Error('Image metadata is not available');
    }

    const aspectRatio = metadata.width / metadata.height;
    const targetAspectRatio = targetWidth / targetHeight;

    let cropWidth = targetWidth;
    let cropHeight = targetHeight;

    if (aspectRatio > targetAspectRatio) {
      cropWidth = Math.floor(targetHeight * aspectRatio);
    } else if (aspectRatio < targetAspectRatio) {
      cropHeight = Math.floor(targetWidth / aspectRatio);
    }

    const left = Math.floor((cropWidth - targetWidth) / 2);
    const top = Math.floor((cropHeight - targetHeight) / 2);

    return { cropWidth, cropHeight, left, top };
  }

  /**
   * 센터 크롭 후 지정 크기로 리사이즈
   */
  centerCrop(
    width: number,
    height: number,
    options?: {
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      position?: string | { left: number; top: number };
      background?: { r: number; g: number; b: number; alpha: number };
    },
  ): this {
    this.image = this.image.resize(width, height, {
      fit: options?.fit ?? 'cover',
      position:
        typeof options?.position === 'object'
          ? undefined
          : (options?.position ?? 'center'),
      background: options?.background ?? { r: 255, g: 255, b: 255, alpha: 0 },
    });
    return this;
  }

  /**
   * 섬네일 만들기 (비율 유지)
   */
  createThumbnail(
    maxWidth: number,
    maxHeight: number,
    options?: {
      withoutEnlargement?: boolean;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    },
  ): this {
    this.image = this.image.resize({
      width: maxWidth,
      height: maxHeight,
      fit: options?.fit ?? 'inside',
      withoutEnlargement: options?.withoutEnlargement ?? true,
    });
    return this;
  }

  /**
   * 섬네일 만들기 (1:1 비율)
   */
  async createSquareThumbnail(
    size: number,
    options?: {
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      position?: string | { left: number; top: number };
      withoutEnlargement?: boolean;
      background?: { r: number; g: number; b: number; alpha: number };
    },
  ): Promise<Buffer> {
    const metadata = await this.image.metadata();
    const { cropWidth, cropHeight, left, top } = ImageUtil.calculateCrop(
      metadata,
      size,
      size,
    );

    this.image = this.image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .resize(size, size, {
        fit: options?.fit ?? 'cover',
        position:
          typeof options?.position === 'object'
            ? undefined
            : (options?.position ?? 'center'),
        withoutEnlargement: options?.withoutEnlargement ?? true,
        background: options?.background ?? { r: 255, g: 255, b: 255, alpha: 0 },
      });
    return await this.image.toBuffer();
  }

  /**
   * 포맷 변경 + 압축 설정
   */
  convertFormat(
    format: 'jpeg' | 'png' | 'webp' | 'avif' | 'tiff',
    options?: {
      quality?: number;
      progressive?: boolean;
      lossless?: boolean;
      compressionLevel?: number; // for png
    },
  ): this {
    const formatOptions: Record<
      'jpeg' | 'png' | 'webp' | 'avif' | 'tiff',
      object
    > = {
      jpeg: {
        quality: options?.quality ?? 80,
        progressive: options?.progressive ?? true,
      },
      png: {
        quality: options?.quality ?? 80,
        progressive: options?.progressive ?? true,
        compressionLevel: options?.compressionLevel ?? 9,
      },
      webp: {
        quality: options?.quality ?? 80,
        lossless: options?.lossless ?? false,
      },
      avif: { quality: options?.quality ?? 50 },
      tiff: { quality: options?.quality ?? 80 },
    };

    if (!formatOptions[format]) {
      throw new Error(`Unsupported format: ${format}`);
    }

    this.image = this.image[format](formatOptions[format]);
    return this;
  }

  /**
   * 이미지 회전
   */
  rotateImage(
    angle: number,
    options?: {
      background?: { r: number; g: number; b: number; alpha: number };
    },
  ): this {
    this.image = this.image.rotate(angle, {
      background: options?.background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    });
    return this;
  }

  /**
   * 이미지 플립 (수평 또는 수직)
   */
  flipImage(options?: { horizontal?: boolean; vertical?: boolean }): this {
    if (options?.horizontal) this.image = this.image.flop();
    if (options?.vertical) this.image = this.image.flip();
    return this;
  }

  /**
   * 이미지 회전 후 리사이즈
   */
  async rotateAndResize(
    angle: number,
    width: number,
    height: number,
    options?: {
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      background?: { r: number; g: number; b: number; alpha: number };
    },
  ): Promise<Buffer> {
    this.image = this.image
      .rotate(angle, {
        background: options?.background ?? { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .resize(width, height, { fit: options?.fit ?? 'cover' });
    return await this.image.toBuffer();
  }

  /**
   * 이미지 밝기 조정
   */
  adjustBrightness(brightness: number, options?: { contrast?: number }): this {
    this.image = this.image.modulate({ brightness: 1 + brightness });
    if (options?.contrast !== undefined) {
      this.image = this.image.linear(
        1 + options.contrast,
        -(128 * options.contrast),
      );
    }
    return this;
  }

  /**
   * 이미지 대비 조정
   */
  async adjustContrast(contrast: number): Promise<Buffer> {
    this.image = this.image.linear(1 + contrast, -(128 * contrast));
    return await this.image.toBuffer();
  }

  /**
   * 이미지 블러 처리
   */
  applyBlur(sigma: number = 1, options?: { edgeDetection?: boolean }): this {
    this.image = this.image.blur(sigma);
    if (options?.edgeDetection) {
      this.image = this.image.convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
      });
    }
    return this;
  }

  /**
   * 최종 결과를 Buffer로 반환
   */
  async toBuffer(): Promise<Buffer> {
    return await this.image.toBuffer();
  }

  /**
   * 최종 결과를 파일로 저장
   */
  async toFile(filePath: string): Promise<void> {
    await this.image.toFile(filePath);
  }
}
