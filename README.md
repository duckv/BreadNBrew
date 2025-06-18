# Bread N' Brew - Cafe Website

A modern, responsive website for Bread N' Brew cafe in Berkeley Heights, NJ. Features an interactive menu, shopping cart, order customization, and mobile-friendly design.

## 🚀 Quick Start

1. **Clone the repository**
2. **Open index.html** in your browser or serve with a local server
3. **Start developing** by modifying the files as needed

```bash
# For development with live reload (optional)
npm install -g http-server
http-server . -p 3000
```

## 📁 Project Structure

```
bread-n-brew/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styles and animations
├── script.js           # Main JavaScript application logic
├── data.js            # Menu data and configuration
├── images/            # Image assets (see Image Guidelines below)
│   ├── menu/          # Menu item images by category
│   ├── gallery/       # Cafe photo gallery
│   ├── hero/          # Hero section backgrounds
│   └── icons/         # Logo and brand assets
├── package.json       # Project metadata and scripts
└── README.md         # This file
```

## 🎨 Image Guidelines

### File Organization

- **Menu items**: `images/menu/{category}/{item-name}.jpg`
- **Gallery photos**: `images/gallery/{descriptive-name}.jpg`
- **Hero backgrounds**: `images/hero/cafe-hero-bg.jpg`
- **Brand assets**: `images/icons/{logo/favicon}.{png/ico}`

### Image Specifications

#### Menu Items

- **Format**: JPG or WebP
- **Dimensions**: 400x400px (square aspect ratio)
- **Quality**: High quality, web-optimized
- **File size**: < 150KB per image
- **Naming**: Use lowercase with hyphens (e.g., `butter-croissant.jpg`)

#### Gallery Images

- **Format**: JPG or WebP
- **Dimensions**: Various sizes (maintain original aspect ratio)
- **Quality**: High quality for showcasing cafe ambiance
- **File size**: < 300KB per image

#### Hero Background

- **Format**: JPG or WebP
- **Dimensions**: 1920x1080px minimum (landscape)
- **Mobile version**: 768x1024px (portrait, optional)
- **Quality**: High quality, optimized for web
- **File size**: < 500KB

#### Brand Assets

- **Logo**: PNG with transparency, multiple sizes
- **Favicon**: ICO format, 32x32px
- **Apple touch icon**: PNG, 180x180px

### Image Optimization

- Use tools like TinyPNG, ImageOptim, or Squoosh
- Maintain quality while reducing file size
- Consider WebP format for better compression
- Provide fallbacks for older browsers if using WebP

### Updating Image Paths

When adding local images, update the `data.js` file:

```javascript
// Replace external URLs:
img: "https://external-service.com/image.jpg";

// With local paths:
img: "./images/menu/pastries/butter-croissant.jpg";
```

## 💻 Development Guidelines

### Code Style

- **HTML**: Use semantic markup, proper indentation
- **CSS**: BEM methodology for class naming when possible
- **JavaScript**: ES6+ features, clear function names, comments for complex logic
- **Responsive**: Mobile-first approach, test on various devices

### File Management

- Keep files modular and organized
- Don't put everything in one large file
- Use descriptive file and function names
- Comment complex functionality

### Testing Checklist

- [ ] Test on mobile devices (responsive design)
- [ ] Test cart functionality (add/remove/quantity)
- [ ] Test menu filtering and search
- [ ] Test form submissions
- [ ] Check image loading and optimization
- [ ] Verify accessibility (keyboard navigation, screen readers)

## 🏗️ Architecture

### HTML Structure

- **Semantic markup** for better SEO and accessibility
- **Responsive design** with mobile-first approach
- **Progressive enhancement** for better performance

### CSS Organization

- **Custom properties** for consistent theming
- **Flexbox and Grid** for layout
- **Tailwind CSS** for utility classes
- **Custom animations** for enhanced UX

### JavaScript Modules

- **State management** for cart and filters
- **Event delegation** for better performance
- **Modular functions** for maintainability
- **Error handling** for robust user experience

## 🛠️ Features

### Menu System

- **Category filtering** (All, Pastries, Breads, Coffee, etc.)
- **Search functionality** by item name or description
- **Item customization** (size, toppings, temperature)
- **Dynamic pricing** based on customizations

### Shopping Cart

- **Add/remove items** with quantity controls
- **Real-time calculations** (subtotal, tax, tip)
- **Pickup time selection** with business hours validation
- **Order customization** and special requests

### Responsive Design

- **Mobile-optimized** navigation and layout
- **Touch-friendly** buttons and interactions
- **Flexible grid** system for various screen sizes
- **Optimized images** for different devices

## 🎯 Performance Guidelines

### Image Performance

- **Lazy loading** for images below the fold
- **Appropriate formats** (WebP with JPG fallback)
- **Proper sizing** to avoid unnecessary downloads
- **CDN usage** for external assets when needed

### Code Performance

- **Minimize HTTP requests** by combining files when appropriate
- **Optimize critical rendering path**
- **Use efficient selectors** in CSS and JavaScript
- **Debounce search inputs** to avoid excessive API calls

## 🔧 Configuration

### Business Settings

Update these values in `data.js`:

```javascript
const APP_CONFIG = {
  NJ_SALES_TAX_RATE: 0.06625, // New Jersey sales tax
  MAX_QUANTITY_PER_ITEM: 25, // Maximum items per order
  MAX_ORDER_AMOUNT: 150, // Maximum order total
  STORE_HOURS: {
    open: 7, // 7 AM
    close: 17, // 5 PM
  },
};
```

### Contact Information

Update contact details in `data.js`:

```javascript
const CONTACT_INFO = {
  phone: "(908) 933-0123",
  email: "breadnbrew512@gmail.com",
  address: {
    street: "512 Springfield Ave",
    city: "Berkeley Heights",
    state: "NJ",
    zip: "07922",
  },
};
```

## 📱 Browser Support

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Legacy support**: IE11 with polyfills (if needed)

## 🚀 Deployment

### Static Hosting

This is a static website and can be deployed to:

- **Netlify** (recommended for easy deployment)
- **Vercel** (great for static sites)
- **GitHub Pages** (free for public repositories)
- **AWS S3** + CloudFront (for enterprise)

### Pre-deployment Checklist

- [ ] Optimize all images
- [ ] Minify CSS and JavaScript
- [ ] Test on multiple devices and browsers
- [ ] Verify all links and forms work
- [ ] Check page load speed
- [ ] Validate HTML and CSS
- [ ] Test accessibility features

## 🐛 Troubleshooting

### Common Issues

**Images not loading**

- Check file paths in `data.js`
- Verify image files exist in correct folders
- Check image file extensions match the code

**Cart not working**

- Check browser console for JavaScript errors
- Verify Lucide icons are loading (for cart icons)
- Test with different items and quantities

**Mobile layout issues**

- Test on actual devices, not just browser dev tools
- Check viewport meta tag is present
- Verify touch targets are at least 44px

**Performance issues**

- Optimize images (compress, proper formats)
- Check for large/unused CSS or JavaScript
- Use browser dev tools to identify bottlenecks

## 📞 Support

For questions or issues:

- **Email**: breadnbrew512@gmail.com
- **Phone**: (908) 933-0123
- **Address**: 512 Springfield Ave, Berkeley Heights, NJ 07922

## 📄 License

This project is private and proprietary to Bread N' Brew cafe.

---

_Last updated: December 2024_
