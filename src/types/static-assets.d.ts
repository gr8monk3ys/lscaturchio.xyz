declare module "*.webp" {
  const content: import("next/image").StaticImageData
  export default content
}

declare module "*.svg" {
  const content: import("next/image").StaticImageData
  export default content
}
