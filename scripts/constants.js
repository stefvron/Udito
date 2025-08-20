export const constants = {
    "slider": {
        "float": {
            "step_size": 0.05
        },
        "int": {
            "step_size": 1
        }
    },
    "error_factor": {
        "min": 0,
        "max": 2,
        "default": 1
    },
    "ids": {
        "image_upload": "img_up",
        "palettes": "palletes",
        "colouring_algorithm": "algorithms",
        "colour_comparison": "comparison",
        "error_factor": "error_factor",
        "width_percent": "w_perc",
        "height_percent": "h_perc",
        "width_px": "w_px",
        "height_px": "h_px",
        "keep_aspect_ratio": "keep_ar",
        "live_preview": "live_preview",
        "render_button": "render_btn",
        "original_canvas": "original_image",
        "processed_canvas": "processed_image",
        "rendered_canvas": "rendered_image",
        "download_button": "download_btn",
        "download_grid_button": "download_grid_btn",
    },
    "shaders": {
        "vertex_shader": "vertexShader.glsl",
        "directory": "/shaders/",
    }
};

// Load the configuration file
const reqConf = await fetch('/config.json');
if(!reqConf.ok) {
    console.error('Failed to load configuration:', reqConf.statusText);
}
export const config = await reqConf.json();
