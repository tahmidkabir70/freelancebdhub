/**
 * FREELANCE BD HUB — INTERNATIONALIZATION (i18n) MODULE
 * Complete bilingual dictionary (English ↔ বাংলা) for the public website.
 * localStorage key: fbh_lang  |  Default: 'bn'
 */

export const translations = {

  // ════════════════════════════════════════════════════════════════════
  //  BENGALI  (bn)
  // ════════════════════════════════════════════════════════════════════
  bn: {

    // ─── Navigation ───
    nav_home: 'হোম',
    nav_articles: 'সব আর্টিকেল',
    nav_categories: 'ক্যাটাগরি',
    nav_about: 'আমাদের সম্পর্কে',
    nav_contact: 'যোগাযোগ',
    nav_admin: 'এডমিন প্যানেল',
    nav_admin_login: 'এডমিন লগইন',
    nav_admin_dashboard: 'এডমিন ড্যাশবোর্ড',
    nav_search_placeholder: 'আর্টিকেল, বিষয় বা টেকনোলজি খুঁজুন...',
    nav_search_label: 'অনুসন্ধান',
    nav_open_menu: 'মেনু খুলুন',
    nav_close_menu: 'বন্ধ করুন',
    nav_brand_tagline: 'Learn. Build. Freelance.',

    // ─── Header actions ───
    header_theme_light: 'লাইট মোডে পরিবর্তন করুন',
    header_theme_dark: 'ডার্ক মোডে পরিবর্তন করুন',
    header_lang_switch: 'ভাষা পরিবর্তন করুন',
    header_lang_bn: 'বাং',
    header_lang_en: 'EN',
    header_lang_full_bn: 'বাংলা',
    header_lang_full_en: 'English',

    // ─── Hero ───
    hero_badge: '🚀 বাংলাদেশের নির্ভরযোগ্য ফ্রিল্যান্সিং লার্নিং প্ল্যাটফর্ম',
    hero_title_main: 'Learn. Build.',
    hero_title_accent: 'Freelance.',
    hero_subtitle_bn: 'শিখুন। তৈরি করুন। ফ্রিল্যান্স করুন।',
    hero_desc: 'আন্তর্জাতিক মার্কেটপ্লেসে সফল ক্যারিয়ার গড়তে কোডিং, আধুনিক টেকনোলজি, ক্লায়েন্ট কমিউনিকেশন ও রিমোট জবের নির্ভরযোগ্য বাংলা ও ইংরেজি গাইডলাইন।',
    hero_btn_explore: 'পড়া শুরু করুন',
    hero_btn_categories: 'বিষয়ভিত্তিক ক্যাটাগরি ব্রাউজ করুন',

    // ─── Section headings ───
    section_featured: 'নির্বাচিত আর্টিকেল',
    section_featured_sub: 'এই সপ্তাহের সেরা নির্বাচিত নির্দেশিকা ও প্রজেক্ট',
    section_categories: 'জনপ্রিয় ক্যাটাগরি',
    section_categories_sub: 'আপনার পছন্দের দক্ষতা অনুযায়ী রিসোর্স ও গাইডলাইন বেছে নিন',
    section_latest: 'সর্বশেষ আর্টিকেল',
    section_latest_sub: 'প্রতিদিন নতুন প্রযুক্তি ও ফ্রিল্যান্সিং কৌশলে নিজেকে আপগ্রেড রাখুন',
    section_trending: 'ট্রেন্ডিং বিষয়সমূহ',
    section_weekly_top: 'এই সপ্তাহের সেরা',
    section_view_all: 'সব দেখুন →',
    section_read_more: 'আরও পড়ুন →',
    section_view_all_short: 'সব দেখুন',

    // ─── Advertisement ───
    ad_label: 'বিজ্ঞাপন',

    // ─── Buttons ───
    btn_read_more: 'সম্পূর্ণ পড়ুন →',
    btn_read_article: 'আর্টিকেল পড়ুন →',
    btn_load_more: 'আরও লোড করুন (Load More)',
    btn_search: 'অনুসন্ধান',
    btn_clear: 'ক্লিয়ার',
    btn_clear_search: 'অনুসন্ধান মুছুন',
    btn_close: 'বন্ধ করুন',
    btn_cancel: 'বাতিল',
    btn_confirm: 'নিশ্চিত করুন',
    btn_yes: 'হ্যাঁ',
    btn_no: 'না',
    btn_ok: 'ঠিক আছে',
    btn_try_again: 'আবার চেষ্টা করুন',
    btn_retry: 'পুনরায় চেষ্টা করুন',
    btn_back: '← ফিরে যান',
    btn_back_home: '← হোমপেজে ফিরে যান',
    btn_browse_categories: 'ক্যাটাগরি ব্রাউজ করুন',
    btn_go_home: '← হোমপেজে ফিরে যান',
    btn_go_home_short: '← হোমপেজ',
    btn_subscribe: 'সাবস্ক্রাইব করুন',
    btn_send_message: 'মেসেজ পাঠান',
    btn_submit_comment: 'মন্তব্য পোস্ট করুন',
    btn_copy_link: '📋 লিংক কপি করুন',
    btn_share_facebook: 'Facebook',
    btn_share_whatsapp: 'WhatsApp',
    btn_share_copy: 'লিংক কপি',
    btn_admin_login: '🔐 এডমিন লগইন',

    // ─── Article page ───
    article_breadcrumb_home: 'হোম',
    article_breadcrumb_category: 'ক্যাটাগরি',
    article_meta_published: 'প্রকাশিত',
    article_meta_updated: 'আপডেট',
    article_meta_reading_time: '{minutes} মিনিট পাঠ',
    article_meta_views: '{count} ভিউ',
    article_meta_words: '{count} শব্দ',
    article_toc_title: '📑 এই আর্টিকেলের বিষয়বস্তু (Table of Contents)',
    article_toc_show: 'দেখান',
    article_toc_hide: 'লুকান',
    article_tags_heading: 'সম্পর্কিত ট্যাগ (Tags):',
    article_share_heading: 'শেয়ার করুন:',
    article_share_copied: 'আর্টিকেল লিংক কপি করা হয়েছে!',
    article_prev_label: '← পূর্ববর্তী আর্টিকেল',
    article_next_label: 'পরবর্তী আর্টিকেল →',
    article_prev_fallback: 'পূর্ববর্তী',
    article_next_fallback: 'পরবর্তী',
    article_related_title: '💡 সম্পর্কিত আর্টিকেল (Related Articles)',
    article_not_found: 'আর্টিকেলটি খুঁজে পাওয়া যায়নি।',
    article_loading: 'আর্টিকেল লোড হচ্ছে...',
    article_empty_content: 'এই আর্টিকেলের কোনো কনটেন্ট পাওয়া যায়নি।',
    article_fallback_notice: 'এই আর্টিকেলটি এই মুহূর্তে শুধুমাত্র {language} ভাষায় উপলব্ধ।',
    article_author_default: 'FBH Editorial',
    article_author_prefix: 'লেখক:',
    article_views_label: 'ভিউ',
    article_minutes_label: 'মিনিট পাঠ',
    article_language_switch_aria: 'এই আর্টিকেলের ভাষা পরিবর্তন করুন',
    article_language_bn: 'বাংলা',
    article_language_en: 'English',
    article_language_preview_notice: 'প্রিভিউ মোড — আপনি ড্রাফট আর্টিকেল দেখছেন।',

    // ─── Comments ───
    comments_title: '💬 পাঠক মন্তব্য (Comments)',
    comments_form_name_label: 'আপনার নাম (Your Name) *',
    comments_form_name_placeholder: 'নাম লিখুন...',
    comments_form_text_label: 'আপনার মতামত বা প্রশ্ন (Comment) *',
    comments_form_text_placeholder: 'এই আর্টিকেল সম্পর্কে আপনার কোনো প্রশ্ন বা মতামত থাকলে লিখুন...',
    comments_empty: 'এখনও কোনো অনুমোদিত মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!',
    comments_count: '{count}টি মন্তব্য',
    comments_success: 'ধন্যবাদ! আপনার মন্তব্যটি মডারেশনের জন্য জমা হয়েছে।',
    comments_error_generic: 'মন্তব্য জমা দিতে ব্যর্থ হয়েছে।',
    comments_error_required: 'নাম এবং মন্তব্য আবশ্যক।',
    comments_error_fill_all: 'সবগুলো ঘর পূরণ করুন।',

    // ─── Newsletter ───
    newsletter_title: 'সাপ্তাহিক ফ্রিল্যান্সিং আপডেট পান',
    newsletter_desc: 'নতুন কাজের কৌশল, প্রযুক্তি টিউটোরিয়াল এবং রিমোট ক্যারিয়ার টিপস সরাসরি আপনার ইমেইলে পেতে সাবস্ক্রাইব করুন। কোনো স্প্যাম নেই।',
    newsletter_placeholder: 'আপনার ইমেইল অ্যাড্রেস লিখুন...',
    newsletter_btn: 'সাবস্ক্রাইব করুন',
    newsletter_disclaimer: 'আমরা কোনো স্প্যাম পাঠাই না। যেকোনো সময় আনসাবস্ক্রাইব করা যাবে।',
    newsletter_success: 'ধন্যবাদ! নিউজলেটারে সফলভাবে সাবস্ক্রাইব করা হয়েছে।',
    newsletter_error: 'নিউজলেটার সাইন-আপ সম্পন্ন করা যায়নি।',
    newsletter_error_email: 'সঠিক ইমেইল ঠিকানা প্রদান করুন।',

    // ─── Category page ───
    category_all: 'সকল ক্যাটাগরি',
    category_all_short: '🌟 সকল ক্যাটাগরি',
    category_title: 'সকল ক্যাটাগরি ব্রাউজ করুন',
    category_desc: 'দক্ষতা বৃদ্ধি এবং মার্কেটপ্লেসে সফলতার জন্য প্রয়োজনীয় সব রিসোর্স বিষয়ভিত্তিক সাজানো হয়েছে।',
    category_meta_total: 'সর্বমোট {count}টি বিভাগ',
    category_articles_heading: '{name} এর আর্টিকেলসমূহ',
    category_articles_count: 'মোট {count}টি আর্টিকেল প্রাপ্ত',
    category_articles_badge: '{count}টি আর্টিকেল',
    category_empty: 'এই ক্যাটাগরিতে এখনও কোনো প্রকাশিত আর্টিকেল নেই',
    category_empty_desc: 'আমাদের এডমিন প্যানেল থেকে শীঘ্রই নতুন কনটেন্ট যুক্ত করা হবে।',
    category_back_home: '← হোমপেজে ফিরে যান',
    category_browse: 'ক্যাটাগরি ব্রাউজ করুন',
    category_default_label: 'টিউটোরিয়াল',
    category_grid_heading: 'আর্টিকেল তালিকা',

    // ─── Tags ───
    tags_heading: 'সম্পর্কিত ট্যাগ (Tags):',
    tags_filter_heading: 'ফিল্টার ট্যাগ:',
    tags_all: 'সবগুলো',

    // ─── Search page ───
    search_title: 'আর্টিকেল অনুসন্ধান ও ফিল্টার',
    search_desc: 'টাইটেল, কি-ওয়ার্ড বা পছন্দের ক্যাটাগরি দিয়ে নিমেষেই আর্টিকেল খুঁজুন',
    search_input_placeholder: 'শিরোনাম, বিবরণ বা ট্যাগ অনুসন্ধান করুন...',
    search_status_all: 'সকল প্রকাশিত আর্টিকেল',
    search_status_query: '"{query}" এর জন্য অনুসন্ধানের ফলাফল',
    search_results_count: '{count}টি পাওয়া গেছে',
    search_results_found: '{count}টি ফলাফল পাওয়া গেছে',
    search_no_results_title: 'কোনো ফলাফল পাওয়া যায়নি',
    search_no_results_desc: 'অনুগ্রহ করে অন্য কি-ওয়ার্ড বা ক্যাটাগরি দিয়ে অনুসন্ধান করার চেষ্টা করুন।',
    search_loading: 'ফলাফল লোড হচ্ছে...',

    // ─── Footer ───
    footer_desc: 'বাংলাদেশের তরুণ ডেভেলপার ও ফ্রিল্যান্সারদের আন্তর্জাতিক বাজারে দক্ষ করে গড়ে তোলার উন্মুক্ত জ্ঞানকেন্দ্র।',
    footer_tagline: 'Learn. Build. Freelance.',
    footer_quick_links: 'কুইক লিংকস',
    footer_categories: 'জনপ্রিয় ক্যাটাগরি',
    footer_legal: 'সংযুক্ত থাকুন',
    footer_privacy: 'প্রাইভেসি পলিসি',
    footer_terms: 'ব্যবহারের শর্তাবলী',
    footer_contact: 'যোগাযোগ ও ফিডব্যাক',
    footer_about: 'আমাদের সম্পর্কে',
    footer_articles: 'সব আর্টিকেল',
    footer_categories_list: 'ক্যাটাগরি তালিকা',
    footer_contact_desc: 'আমাদের যেকোনো তথ্যের জন্য সরাসরি যোগাযোগ করুন অথবা এডমিন পোর্টাল পরিদর্শন করুন।',
    footer_copyright: '© ২০২৬ Freelance BD Hub। সর্বস্বত্ব সংরক্ষিত।',
    footer_designed: 'Designed for Excellence • Mobile-First Bengali & English Publication',
    footer_admin_login: 'এডমিন লগইন',
    footer_cat_freelancing: 'ফ্রিল্যান্সিং গাইড',
    footer_cat_webdev: 'ওয়েব ডেভেলপমেন্ট',
    footer_cat_ai: 'এআই ও অটোমেশন',
    footer_cat_remote: 'রিমোট জব ও ক্যারিয়ার',
    footer_cat_payment: 'পেমেন্ট ও ব্যাংকিং',

    // ─── Drawer / Search modal ───
    drawer_language_label: 'Language:',
    search_modal_hint: 'অনুসন্ধান করতে Enter চাপুন বা সরাসরি টাইপ করুন।',
    search_modal_placeholder: 'আর্টিকেল বা বিষয় খুঁজুন...',

    // ─── Homepage dynamic ───
    home_featured_empty: 'শীঘ্রই নতুন ফিচার্ড আর্টিকেল যুক্ত করা হবে।',
    home_latest_empty: 'কোনো আর্টিকেল পাওয়া যায়নি।',
    home_views_meta: '👁️ {count} বার পঠিত • ⏱️ {minutes} মিনিট',
    card_reading_time: '⏱️ {minutes} মিনিট',
    card_category_general: 'সাধারণ',

    // ─── About / Contact / Privacy / Terms / 404 ───
    about_badge: 'About Freelance BD Hub',
    about_title: 'আমাদের লক্ষ্য ও উদ্দেশ্য (Our Mission)',
    about_tagline: '"শিখুন। তৈরি করুন। ফ্রিল্যান্স করুন।" — Learn. Build. Freelance.',
    about_contact_cta: 'যোগাযোগ পেইজ →',
    about_contact_prompt: 'আমাদের সাথে যোগাযোগ করতে চান?',
    about_contact_desc: 'আপনার মতামত, পরামর্শ বা প্রশ্ন পাঠাতে পারেন।',

    contact_title: 'যোগাযোগ করুন (Contact Us)',
    contact_desc: 'আমাদের কনটেন্ট, ক্যারিয়ার গাইডলাইন বা প্ল্যাটফর্ম সম্পর্কিত যেকোনো প্রশ্ন বা মতামত আমাদের কাছে সরাসরি পাঠাতে পারেন।',
    contact_name_label: 'আপনার পূর্ণ নাম (Full Name) *',
    contact_name_placeholder: 'নাম লিখুন...',
    contact_email_label: 'ইমেইল ঠিকানা (Email Address) *',
    contact_email_placeholder: 'example@gmail.com',
    contact_subject_label: 'বিষয় (Subject) *',
    contact_subject_placeholder: 'বার্তার মূল বিষয়...',
    contact_message_label: 'বার্তা (Message) *',
    contact_message_placeholder: 'আপনার বার্তা বিস্তারিত লিখুন...',
    contact_submit: 'মেসেজ পাঠান',
    contact_success: 'ধন্যবাদ! আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।',
    contact_error_fill_all: 'অনুগ্রহ করে সবগুলো ঘর পূরণ করুন।',
    contact_error_send: 'বার্তা প্রেরণ ব্যর্থ হয়েছে।',

    privacy_title: 'গোপনীয়তা নীতিমালা (Privacy Policy)',
    privacy_last_updated: 'সর্বশেষ হালনাগাদ: সেপ্টেম্বর ২৬, ২০২৬',
    terms_title: 'ব্যবহারের শর্তাবলী (Terms of Service)',
    terms_last_updated: 'সর্বশেষ হালনাগাদ: সেপ্টেম্বর ২৬, ২০২৬',

    err_404_title: 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি',
    err_404_heading: 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি',
    err_404_desc: 'দুঃখিত, আপনি যে আর্টিকেল বা পৃষ্ঠাটি খুঁজছেন সেটি স্থানান্তরিত বা মুছে ফেলা হয়েছে।',
    err_404_search_placeholder: 'আর্টিকেল খুঁজুন...',
    err_404_search_btn: 'অনুসন্ধান',

    // ─── States ───
    state_loading: 'লোড হচ্ছে...',
    state_loading_short: 'লোড হচ্ছে',
    state_no_data: 'কোনো ডেটা নেই',
    state_no_results: 'কোনো ফলাফল পাওয়া যায়নি',
    state_empty: 'খালি',
    state_error: 'ত্রুটি হয়েছে',
    state_error_generic: 'কিছু একটা ভুল হয়েছে।',
    state_success: 'সফল',
    state_saved: 'সংরক্ষিত',
    state_deleted: 'মুছে ফেলা হয়েছে',
    state_updated: 'আপডেট হয়েছে',

    // ─── Ads ───
    ad_slot_label: 'Advertisement',

    // ─── Status badges ───
    status_active: 'সক্রিয়',
    status_inactive: 'নিষ্ক্রিয়',
    status_draft: 'খসড়া',
    status_published: 'প্রকাশিত',
    status_archived: 'আর্কাইভ',
    status_scheduled: 'তফসিলকৃত',

    // ─── Misc ───
    misc_by: 'লেখক:',
    misc_on: 'তারিখ:',
    misc_read_time: 'মিনিট পড়ার সময়',
    misc_words: 'শব্দ',
    misc_views: 'ভিউ',
    misc_comments: 'মন্তব্য',
    misc_and: 'এবং',

    // ─── Languages ───
    lang_bn: 'বাংলা',
    lang_en: 'English'
  },

  // ════════════════════════════════════════════════════════════════════
  //  ENGLISH  (en)
  // ════════════════════════════════════════════════════════════════════
  en: {

    // ─── Navigation ───
    nav_home: 'Home',
    nav_articles: 'All Articles',
    nav_categories: 'Categories',
    nav_about: 'About Us',
    nav_contact: 'Contact',
    nav_admin: 'Admin Panel',
    nav_admin_login: 'Admin Login',
    nav_admin_dashboard: 'Admin Dashboard',
    nav_search_placeholder: 'Search articles, topics or technology...',
    nav_search_label: 'Search',
    nav_open_menu: 'Open menu',
    nav_close_menu: 'Close',
    nav_brand_tagline: 'Learn. Build. Freelance.',

    // ─── Header actions ───
    header_theme_light: 'Switch to light mode',
    header_theme_dark: 'Switch to dark mode',
    header_lang_switch: 'Switch language',
    header_lang_bn: 'বাং',
    header_lang_en: 'EN',
    header_lang_full_bn: 'বাংলা',
    header_lang_full_en: 'English',

    // ─── Hero ───
    hero_badge: "🚀 Bangladesh's Premier Freelancing & Tech Platform",
    hero_title_main: 'Learn. Build.',
    hero_title_accent: 'Freelance.',
    hero_subtitle_bn: 'Learn. Build. Freelance.',
    hero_desc: 'Reliable guidelines on coding, modern technology, client communication, and remote careers to build a thriving international freelance presence.',
    hero_btn_explore: 'Start Reading',
    hero_btn_categories: 'Browse Categories',

    // ─── Section headings ───
    section_featured: 'Featured Articles',
    section_featured_sub: 'Curated deep-dives and proven industry strategies for this week',
    section_categories: 'Popular Categories',
    section_categories_sub: 'Choose roadmaps and practical resources based on your chosen track',
    section_latest: 'Latest Articles',
    section_latest_sub: 'Stay updated with cutting-edge engineering and freelancing workflows',
    section_trending: 'Trending Topics',
    section_weekly_top: 'Top of the Week',
    section_view_all: 'View All →',
    section_read_more: 'Read More →',
    section_view_all_short: 'View All',

    // ─── Advertisement ───
    ad_label: 'Advertisement',

    // ─── Buttons ───
    btn_read_more: 'Read Full Article →',
    btn_read_article: 'Read Article →',
    btn_load_more: 'Load More Articles',
    btn_search: 'Search',
    btn_clear: 'Clear',
    btn_clear_search: 'Clear search',
    btn_close: 'Close',
    btn_cancel: 'Cancel',
    btn_confirm: 'Confirm',
    btn_yes: 'Yes',
    btn_no: 'No',
    btn_ok: 'OK',
    btn_try_again: 'Try Again',
    btn_retry: 'Retry',
    btn_back: '← Back',
    btn_back_home: '← Back to Home',
    btn_browse_categories: 'Browse Categories',
    btn_go_home: '← Back to Home',
    btn_go_home_short: '← Home',
    btn_subscribe: 'Subscribe',
    btn_send_message: 'Send Message',
    btn_submit_comment: 'Post Comment',
    btn_copy_link: '📋 Copy Link',
    btn_share_facebook: 'Facebook',
    btn_share_whatsapp: 'WhatsApp',
    btn_share_copy: 'Copy Link',
    btn_admin_login: '🔐 Admin Login',

    // ─── Article page ───
    article_breadcrumb_home: 'Home',
    article_breadcrumb_category: 'Category',
    article_meta_published: 'Published',
    article_meta_updated: 'Updated',
    article_meta_reading_time: '{minutes} min read',
    article_meta_views: '{count} views',
    article_meta_words: '{count} words',
    article_toc_title: '📑 Table of Contents',
    article_toc_show: 'Show',
    article_toc_hide: 'Hide',
    article_tags_heading: 'Related Tags:',
    article_share_heading: 'Share this article:',
    article_share_copied: 'Article link copied to clipboard!',
    article_prev_label: '← Previous Article',
    article_next_label: 'Next Article →',
    article_prev_fallback: 'Previous',
    article_next_fallback: 'Next',
    article_related_title: '💡 Related Articles',
    article_not_found: 'The article could not be found.',
    article_loading: 'Loading article...',
    article_empty_content: 'No content found for this article.',
    article_fallback_notice: 'This article is currently available only in {language}.',
    article_author_default: 'FBH Editorial',
    article_author_prefix: 'By:',
    article_views_label: 'views',
    article_minutes_label: 'min read',
    article_language_switch_aria: 'Switch this article\'s language',
    article_language_bn: 'বাংলা',
    article_language_en: 'English',
    article_language_preview_notice: 'Preview mode — you are viewing a draft article.',

    // ─── Comments ───
    comments_title: '💬 Reader Comments',
    comments_form_name_label: 'Your Name *',
    comments_form_name_placeholder: 'Enter your name...',
    comments_form_text_label: 'Your Comment or Question *',
    comments_form_text_placeholder: 'Share your thoughts or ask a question about this article...',
    comments_empty: 'No approved comments yet. Be the first to share your thoughts!',
    comments_count: '{count} comments',
    comments_success: 'Thank you! Your comment has been submitted for moderation.',
    comments_error_generic: 'Failed to submit the comment.',
    comments_error_required: 'Name and comment are required.',
    comments_error_fill_all: 'Please fill in all fields.',

    // ─── Newsletter ───
    newsletter_title: 'Get Weekly Freelancing Updates',
    newsletter_desc: 'Subscribe to receive new strategies, tech tutorials, and remote career tips directly in your inbox. No spam.',
    newsletter_placeholder: 'Enter your email address...',
    newsletter_btn: 'Subscribe',
    newsletter_disclaimer: 'We never send spam. Unsubscribe anytime.',
    newsletter_success: 'Thank you! You have been subscribed to the newsletter.',
    newsletter_error: 'Could not complete the newsletter signup.',
    newsletter_error_email: 'Please enter a valid email address.',

    // ─── Category page ───
    category_all: 'All Categories',
    category_all_short: '🌟 All Categories',
    category_title: 'Browse All Categories',
    category_desc: 'All resources needed to build skills and succeed in marketplaces are organized by topic.',
    category_meta_total: '{count} categories in total',
    category_articles_heading: 'Articles in {name}',
    category_articles_count: '{count} articles found',
    category_articles_badge: '{count} articles',
    category_empty: 'No published articles in this category yet',
    category_empty_desc: 'New content will be added soon from our admin panel.',
    category_back_home: '← Back to Home',
    category_browse: 'Browse Categories',
    category_default_label: 'Roadmaps',
    category_grid_heading: 'Article List',

    // ─── Tags ───
    tags_heading: 'Related Tags:',
    tags_filter_heading: 'Filter tags:',
    tags_all: 'All',

    // ─── Search page ───
    search_title: 'Search & Filter Articles',
    search_desc: 'Find articles instantly by title, keyword, or category',
    search_input_placeholder: 'Search title, description, or tags...',
    search_status_all: 'All Published Articles',
    search_status_query: 'Search results for "{query}"',
    search_results_count: '{count} results found',
    search_results_found: '{count} results found',
    search_no_results_title: 'No results found',
    search_no_results_desc: 'Please try a different keyword or category.',
    search_loading: 'Loading results...',

    // ─── Footer ───
    footer_desc: 'An open knowledge hub empowering Bangladeshi developers and freelancers to thrive in the international market.',
    footer_tagline: 'Learn. Build. Freelance.',
    footer_quick_links: 'Quick Links',
    footer_categories: 'Popular Categories',
    footer_legal: 'Stay Connected',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Service',
    footer_contact: 'Contact & Feedback',
    footer_about: 'About Us',
    footer_articles: 'All Articles',
    footer_categories_list: 'Categories',
    footer_contact_desc: 'Contact us directly for any information, or visit the admin portal.',
    footer_copyright: '© 2026 Freelance BD Hub. All rights reserved.',
    footer_designed: 'Designed for Excellence • Mobile-First Bengali & English Publication',
    footer_admin_login: 'Admin Login',
    footer_cat_freelancing: 'Freelancing Guides',
    footer_cat_webdev: 'Web Development',
    footer_cat_ai: 'AI & Automation',
    footer_cat_remote: 'Remote Careers',
    footer_cat_payment: 'Payment & Banking',

    // ─── Drawer / Search modal ───
    drawer_language_label: 'Language:',
    search_modal_hint: 'Press Enter to search or start typing.',
    search_modal_placeholder: 'Search articles or topics...',

    // ─── Homepage dynamic ───
    home_featured_empty: 'No featured articles found.',
    home_latest_empty: 'No articles published yet.',
    home_views_meta: '👁️ {count} views • ⏱️ {minutes} min read',
    card_reading_time: '⏱️ {minutes} min',
    card_category_general: 'General',

    // ─── About / Contact / Privacy / Terms / 404 ───
    about_badge: 'About Freelance BD Hub',
    about_title: 'Our Mission',
    about_tagline: '"Learn. Build. Freelance."',
    about_contact_cta: 'Contact Page →',
    about_contact_prompt: 'Want to get in touch?',
    about_contact_desc: 'Send us your feedback, suggestions, or questions.',

    contact_title: 'Contact Us',
    contact_desc: 'Send us any questions or feedback about our content, career guidance, or the platform.',
    contact_name_label: 'Your Full Name *',
    contact_name_placeholder: 'Enter your name...',
    contact_email_label: 'Email Address *',
    contact_email_placeholder: 'example@gmail.com',
    contact_subject_label: 'Subject *',
    contact_subject_placeholder: 'Message subject...',
    contact_message_label: 'Message *',
    contact_message_placeholder: 'Write your message in detail...',
    contact_submit: 'Send Message',
    contact_success: 'Thank you! Your message has been sent successfully.',
    contact_error_fill_all: 'Please fill in all fields.',
    contact_error_send: 'Failed to send the message.',

    privacy_title: 'Privacy Policy',
    privacy_last_updated: 'Last updated: September 26, 2026',
    terms_title: 'Terms of Service',
    terms_last_updated: 'Last updated: September 26, 2026',

    err_404_title: 'Page Not Found',
    err_404_heading: 'Page Not Found',
    err_404_desc: 'Sorry, the article or page you are looking for has been moved or deleted.',
    err_404_search_placeholder: 'Search articles...',
    err_404_search_btn: 'Search',

    // ─── States ───
    state_loading: 'Loading...',
    state_loading_short: 'Loading',
    state_no_data: 'No data',
    state_no_results: 'No results found',
    state_empty: 'Empty',
    state_error: 'Error',
    state_error_generic: 'Something went wrong.',
    state_success: 'Success',
    state_saved: 'Saved',
    state_deleted: 'Deleted',
    state_updated: 'Updated',

    // ─── Ads ───
    ad_slot_label: 'Advertisement',

    // ─── Status badges ───
    status_active: 'Active',
    status_inactive: 'Inactive',
    status_draft: 'Draft',
    status_published: 'Published',
    status_archived: 'Archived',
    status_scheduled: 'Scheduled',

    // ─── Misc ───
    misc_by: 'By:',
    misc_on: 'On:',
    misc_read_time: 'min read',
    misc_words: 'words',
    misc_views: 'views',
    misc_comments: 'comments',
    misc_and: 'and',

    // ─── Languages ───
    lang_bn: 'বাংলা',
    lang_en: 'English'
  }
};

/* ════════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════════ */

export function toBengaliDigits(num) {
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bn[+w]);
}

export function getCurrentLang() {
  const saved = localStorage.getItem('fbh_lang');
  if (saved === 'en' || saved === 'bn') return saved;
  return 'bn';
}

/**
 * Translate a key with optional interpolation and fallback.
 *   t('nav_home')
 *   t('article_meta_views', { count: 5 })
 *   t('missing_key', 'fallback text')
 *   t('missing_key', { count: 5 }, 'fallback with {count}')
 */
export function t(key, secondArg, thirdArg) {
  const lang = getCurrentLang();
  let vars = null;
  let fallback = '';

  if (typeof secondArg === 'string') {
    fallback = secondArg;
  } else if (secondArg && typeof secondArg === 'object') {
    vars = secondArg;
    fallback = (typeof thirdArg === 'string') ? thirdArg : '';
  }

  let text = (translations[lang] && translations[lang][key]) || fallback || key;

  if (vars && typeof text === 'string') {
    Object.keys(vars).forEach((k) => {
      let value = vars[k];
      if (typeof value === 'number' && lang === 'bn') {
        value = toBengaliDigits(value);
      }
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(value));
    });
  }

  return text;
}

/* ════════════════════════════════════════════════════════════════════
   LANGUAGE CONTROL
   ════════════════════════════════════════════════════════════════════ */

export function setLanguage(lang) {
  if (lang !== 'bn' && lang !== 'en') return;
  localStorage.setItem('fbh_lang', lang);
  document.documentElement.lang = lang;
  applyTranslations();
  window.dispatchEvent(new CustomEvent('fbh-lang-changed', { detail: { lang } }));
}

export function toggleLanguage() {
  setLanguage(getCurrentLang() === 'bn' ? 'en' : 'bn');
}

/* ════════════════════════════════════════════════════════════════════
   DOM APPLICATION
   ════════════════════════════════════════════════════════════════════ */

export function applyTranslations() {
  const lang = getCurrentLang();
  const dict = translations[lang] || translations.bn;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key] !== undefined) el.setAttribute('title', dict[key]);
  });

  document.querySelectorAll('[data-i18n-bn][data-i18n-en]').forEach((el) => {
    const val = lang === 'en' ? el.getAttribute('data-i18n-en') : el.getAttribute('data-i18n-bn');
    if (val) el.textContent = val;
  });

  document.querySelectorAll('.lang-toggle-btn').forEach((btn) => {
    const isEn = lang === 'en';
    btn.innerHTML = `
      <span class="lang-pill ${!isEn ? 'active' : ''}" data-lang="bn">বাং</span>
      <span class="lang-divider">|</span>
      <span class="lang-pill ${isEn ? 'active' : ''}" data-lang="en">EN</span>
    `;
    btn.setAttribute('aria-label', dict.header_lang_switch || 'Switch language');
    btn.setAttribute('title', dict.header_lang_switch || 'Switch language');
  });
}

/* ════════════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════════════ */

let isI18nListenerBound = false;

export function initI18n() {
  const current = getCurrentLang();
  document.documentElement.lang = current;

  if (!isI18nListenerBound) {
    isI18nListenerBound = true;
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.lang-pill');
      if (pill) {
        e.preventDefault();
        e.stopPropagation();
        const targetLang = pill.getAttribute('data-lang');
        if (targetLang) {
          setLanguage(targetLang);
          return;
        }
      }
      const btn = e.target.closest('.lang-toggle-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        toggleLanguage();
      }
    });
  }

  applyTranslations();
}