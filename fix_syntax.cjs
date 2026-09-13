const fs = require('fs');
const path = 'c:/Users/kimsj/Desktop/songildong/gilsmall/src/pages/Admin.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const inject = [
  '                        }}>',
  '                          {editingBanner.subtitle}',
  '                        </p>',
  '                      )}',
  '                    </div>',
  '                  </>',
  '                )}',
  '              </div>',
  '            ) : (',
  '              <div className="prep-banner" style={{',
  '                width: "100%",',
  '                aspectRatio: "4 / 1",'
];

lines.splice(1889, 0, ...inject);

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed syntax error in Admin.jsx');
