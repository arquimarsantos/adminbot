import { consoleLang } from '../config.js';
import pt from './portugues.js';

// sistema de idiomas
let translateLang = '';
if (consoleLang != 'pt') {
    translateLang = pt;
} else if (consoleLang == 'pt') {
    translateLang = pt;
}

export { translateLang, pt };
